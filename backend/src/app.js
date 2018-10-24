import express from 'express';
import { searchBlock, aggregateBlocks, getBestBlock, getBlockCount, searchTransactions } from './db';
const app = express();

app.get('/', (req, res) => res.send('aergoscan stats API'))

app.get('/recentTransactions', async (req, res) => {
    return res.json(await searchTransactions({
        match_all: {}
    }));
});

app.get('/accountTransactions', async (req, res) => {
    return res.json(await searchTransactions({
        bool: {
            should: [
                { term: { from: req.query.address } },
                { term: { to: req.query.address } },
            ]
        }
    }));
});

app.get('/tx', async (req, res) => {
    const maxTps = await searchBlock({
        body: {
            size: 1,
            sort: {
                txs: { "order" : "desc" }
            },
        }
    }, true);

    const bestBlock = await getBestBlock();
    
    const txPerSecond = await aggregateBlocks({ gte: "now-60s/s", lt: "now" }, "1s");
    const txPerMinute = await aggregateBlocks({ gte: "now-60m/m", lt: "now" }, "1m");
    const txPerHour = await aggregateBlocks({ gte: "now-24h/h", lt: "now" }, "1h");
    const txPerDay = await aggregateBlocks({ gte: "now-30d/d", lt: "now" }, "1d");

    const txTotal = txPerDay.map(day => day.sum_txs.value).reduce((a, b) => a + b, 0);
    
    const blockCount = await getBlockCount();
    
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