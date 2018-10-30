import elasticsearch from 'elasticsearch';

import cfg from './config';

export const DB_BLOCK_INDEX = 'block_meta';
export const DB_TX_INDEX = 'transaction_meta';
export const db = new elasticsearch.Client({
    host: cfg.DB_HOST,
    log: ['error'] // 'trace'
});

export const waitForDb = () => {
    return new Promise((resolve) => {
        function connectDb() {
            console.log(`Connecting to elasticsearch on ${cfg.DB_HOST}...`);
            db.ping({requestTimeout: 10000}, (error) => {
                if (error) {
                    console.error('Could not connect, retrying in 3 seconds...');
                    setTimeout(() => {
                        connectDb();
                    }, 3000);
                    return;
                }
                resolve();
            });
        }
        connectDb();
    });
};

export const setupIndex = () => {
    return new Promise(async (resolve) => {
        console.log(`AERGOSCAN_REINDEX = ${process.env.AERGOSCAN_REINDEX}`);
        if (cfg.RECREATE_INDEX) {
            console.log('Deleting existing indices');
            try {
                await db.indices.delete({
                    index: DB_BLOCK_INDEX
                });
            } catch(e) {}
            try {
                await db.indices.delete({
                    index: DB_TX_INDEX
                });
            } catch(e) {}
        
            try {
                await db.indices.create({
                    index: DB_BLOCK_INDEX
                });
                console.log('Setting up re-created block index');
                await db.indices.putMapping({
                    index: DB_BLOCK_INDEX,
                    type: 'block',
                    body: {
                        properties: {
                            ts: {
                                type: "date"
                            },
                            no: {
                                type: "long"
                            }
                        }
                    }
                });
            } catch(e) {}

            try {
                await db.indices.create({
                    index: DB_TX_INDEX
                });
                console.log('Setting up re-created tx index');
                await db.indices.putMapping({
                    index: DB_TX_INDEX,
                    type: 'tx',
                    body: {
                        properties: {
                            ts: {
                                type: "date"
                            },
                            blockno: {
                                type: "long"
                            },
                            from: {
                                type: "keyword"
                            },
                            to: {
                                type: "keyword"
                            }
                        }
                    }
                });
            } catch(e) {}
        }
        resolve();
    });
}

export const searchBlock = (opts, single = false) => {
    return new Promise(async (resolve, reject) => {
        const response = await db.search({
            requestTimeout: 2000,
            index: DB_BLOCK_INDEX,
            ...opts
        });
        if (single) {
            if (response.hits.total == 0) {
                return reject(new Error('Not found'));
            }
            const item = response.hits.hits[0];
            return resolve({hash: item._id, meta: item._source});
        } else {
            return resolve(response.hits.hits.map(item => ({hash: item._id, meta: item._source})));
        }
    });
}

export const searchTransactions = (query) => {
    return new Promise(async (resolve) => {
        const q = {
            requestTimeout: 2000,
            index: DB_TX_INDEX,
            body: {
                query,
                size: 50,
                sort: {
                    blockno: { "order" : "desc" }
                },
            }
        };
        const response = await db.search(q);
        return resolve(response.hits.hits.map(item => ({hash: item._id, meta: item._source})));
    });
}

export const removeBlocks = (lastToKeep, lastToDelete) => {
    return db.deleteByQuery({
        index: DB_BLOCK_INDEX,
        type: 'block',
        body: {
          query: {
            range: { no: { gt: lastToKeep, lte: lastToDelete} }
          }
        }
    });
}

export const getBestBlock = () => {
    return searchBlock({
        body: {
            size: 1,
            sort: {
                no: { "order" : "desc" }
            },
        }
    }, true);
}

export const getBlockCount = async () => {
    const { count } = await db.count({
        index: DB_BLOCK_INDEX
    });
    return count;
}

export const aggregateBlocks = (query, interval) => {
    return new Promise(async (resolve) => {
        const response = await db.search({
            index: DB_BLOCK_INDEX,
            body: {
                query: {
                    range: {
                        ts: query
                    }
                },
                aggs: {
                    grouped_blocks: {
                        "date_histogram" : {
                            "field" : "ts",
                            "interval" : interval
                        },
                        aggs: {
                            sum_txs: { sum: { field: "txs" }},
                            max_txs: { max: { field: "txs" }}
                        }
                    }
                },
            }
        });
        resolve(response.aggregations.grouped_blocks.buckets);
    })
}

/**
 * Add a block
 * @param {object} blocks
 */
export const addBlock = async (block) => {
    await addTransactions(block.body.txsList.map(tx => {
        tx.block = block;
        return tx;
    }));
    return db.create({
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
}

/**
 * Add blocks in bulk
 * @param {object[]} blocks 
 */
export const addBlocks = async (blocks) => {
    if (!blocks.length) return;
    const txsList = blocks.reduce((txsList, block) => txsList.concat(
        block.body.txsList.map(tx => {
            tx.block = block;
            return tx;
        })
    ), []);
    const txCount = txsList.length;
    await addTransactions(txsList);
    console.log(`[sync] Synced ${txCount} tx.`);
    const body = blocks.map(block => [
        { index: { _index: DB_BLOCK_INDEX, _type: 'block', _id: block.hash }},
        {
            no: block.header.blockno,
            ts: block.header.timestamp / 1000000,
            txs: block.body.txsList.length
        }
    ]).reduce((a, b) => a.concat(...b), []);
    return db.bulk({
        body
    }).catch((e) => {
        console.log('Could not save block: ' + e);
    })
}

const addTransactions = (txsList) => {
    if (txsList.length == 0) return;

    return new Promise(async resolve => {
        const chunkSize = 5000;
        if (txsList.length > chunkSize) {
            console.log(`[sync] Processing ${txsList.length} tx in chunks...`);
        }
        while (txsList.length) {
            const chunk = txsList.splice(0, chunkSize);
            const body = chunk.map(tx => [
                { index: { _index: DB_TX_INDEX, _type: 'tx', _id: tx.hash }},
                {
                    from: ''+tx.from,
                    to: ''+tx.to,
                    amount: tx.amount,
                    blockno: tx.block.header.blockno,
                    ts: tx.block.header.timestamp / 1000000
                }
            ]).reduce((a, b) => a.concat(...b), []);
            try {
                await db.bulk({
                    body
                })
            } catch (e) {
                console.log('[sync] Failed to save tx.');
            }
        }
        resolve();
    });
}