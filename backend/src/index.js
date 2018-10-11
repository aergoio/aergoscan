import elasticsearch from 'elasticsearch';
import express from 'express';
import BlockTracker from './tracker.js';
const app = express();
const port = 3000;

const startup = () => {
    const tracker = new BlockTracker();

    const DB_BLOCK_INDEX = 'block_meta';
    const db = new elasticsearch.Client({
        host: process.env.elasticsearch_host,
        log: ['error'] // 'trace'
    });

    const connectDb = () => {
        console.log(`Connecting to elasticsearch on ${process.env.elasticsearch_host}...`);
        db.ping({requestTimeout: 5000, maxRetries: 10}, async (error) => {
            if (error) {
                console.error('Could not connect, retrying in 5 seconds...');
                setTimeout(() => {
                    connectDb();
                }, 5000);
                return;
            }

            console.log('Connected, starting block tracker...');

            /*await db.indices.delete({
                index: DB_BLOCK_INDEX
            });*/
            try {
                await db.indices.create({
                    index: DB_BLOCK_INDEX
                });
            } catch (e) {}
            db.indices.putMapping({
                index: DB_BLOCK_INDEX,
                type: 'block',
                body: {
                    properties: {
                        ts: {
                            type: "date"
                        }
                    }
                }
            });

            tracker.on('block', async (block) => {
                console.log('new block', block.header.blockno, block.header.timestamp, block.hash, block.body.txsList.length);
                db.create({
                    index: DB_BLOCK_INDEX,
                    type: 'block',
                    id: block.hash,
                    body: {
                        no: block.header.blockno,
                        ts: block.header.timestamp / 1000000,
                        txs: block.body.txsList.length
                    }
                }).catch((e) => {
                    console.log('Could not save block: ' + e);
                })
            });

            tracker.start();
        });
    };
    connectDb();

    app.get('/', (req, res) => res.send('Hello World!'))
    app.get('/stats', async (req, res) => {
        // Max tps
        const maxTpsResp = await db.search({
            index: DB_BLOCK_INDEX,
            body: {
                aggs: {
                    max_tps: { max: { field : "txs" } }
                },
            }
        });
        const maxTps = maxTpsResp.aggregations.max_tps.value;
        
        // Tx per minute
        const txPerMinuteResp = await db.search({
            index: DB_BLOCK_INDEX,
            body: {
                query: {
                    range: {
                        ts: {
                            gte: "now-60m/m",
                            lt : "now"
                        }
                    }
                },
                aggs: {
                    tx_per_minute: {
                        "date_histogram" : {
                            "field" : "ts",
                            "interval" : "1m"
                        },
                        aggs: {
                            sum_txs: { sum: { field: "txs" }}
                        }
                    }
                },
            }
        });
        const txPerMinute = txPerMinuteResp.aggregations.tx_per_minute.buckets;

        // Tx per hour
        const txPerHourResp = await db.search({
            index: DB_BLOCK_INDEX,
            body: {
                query: {
                    range: {
                        ts: {
                            gte: "now-24h/h",
                            lt : "now"
                        }
                    }
                },
                aggs: {
                    tx_per_hour: {
                        "date_histogram" : {
                            "field" : "ts",
                            "interval" : "1h"
                        },
                        aggs: {
                            sum_txs: { sum: { field: "txs" }}
                        }
                    }
                },
            }
        });
        const txPerHour = txPerHourResp.aggregations.tx_per_hour.buckets;

        // Tx per day
        const txPerDayResp = await db.search({
            index: DB_BLOCK_INDEX,
            body: {
                query: {
                    range: {
                        ts: {
                            gte: "now-30d/d",
                            lt : "now"
                        }
                    }
                },
                aggs: {
                    tx_per_day: {
                        "date_histogram" : {
                            "field" : "ts",
                            "interval" : "1d"
                        },
                        aggs: {
                            sum_txs: { sum: { field: "txs" }}
                        }
                    }
                },
            }
        });
        const txPerDay = txPerDayResp.aggregations.tx_per_day.buckets;
        
        // Get last block
        const bestBlockResp = await db.search({
            index: DB_BLOCK_INDEX,
            body: {
                size: 1,
                sort: {
                    ts: { "order" : "desc" }
                },
            }
        });
        const bestBlock = {hash: bestBlockResp.hits.hits[0]._id, meta: bestBlockResp.hits.hits[0]._source};
       
        return res.json({
            maxTps,
            bestBlock,
            txPerMinute,
            txPerHour,
            txPerDay
        })
    });

    app.listen(port, () => console.log(`Backend listening on port ${port}.`))
}

startup();

setInterval(() => {
    console.log('Backend is still here')
}, 20000);
