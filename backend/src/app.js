import express from 'express';
import { searchBlock, aggregateBlocks, getBestBlock, getBlockCount, searchTransactions } from './db';
const app = express();

app.get('/', (req, res) => res.send('aergoscan stats API'))

app.get('/recentTransactions', async (req, res) => {
    try {
        return res.json(await searchTransactions({
            match_all: {}
        }));
    } catch(e) {
        return res.json({error: e});
    }
});

app.get('/accountTransactions', async (req, res) => {
    try {
        return res.json(await searchTransactions({
            bool: {
                should: [
                    { term: { from: req.query.address } },
                    { term: { to: req.query.address } },
                ]
            }
        }));
    } catch(e) {
        return res.json({error: e});
    }
});

app.get('/tx', async (req, res) => {
    const [
        txPerSecond,
        txPerMinute,
        txPerHour,
        txPerDay,
        maxTps,
        bestBlock,
        blockCount
    ] = await Promise.all([
        aggregateBlocks({ gte: "now-60s/s", lt: "now" }, "1s"),
        aggregateBlocks({ gte: "now-60m/m", lt: "now" }, "1m"),
        aggregateBlocks({ gte: "now-24h/h", lt: "now" }, "1h"),
        aggregateBlocks({ gte: "now-30d/d", lt: "now" }, "1d"),
        searchBlock({
            body: {
                size: 1,
                sort: {
                    txs: { "order" : "desc" }
                },
            }
        }, true),
        getBestBlock(),
        getBlockCount()
    ]);

    const txTotal = txPerDay.map(day => day.sum_txs.value).reduce((a, b) => a + b, 0);
    
    return res.json({
        blockCount,
        maxTps,
        txTotal,
        bestBlock,
        txPerSecond,
        txPerMinute,
        txPerHour,
        txPerDay
    })
});

export default app;