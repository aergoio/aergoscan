import express from 'express';
import { ApiClient } from './db';
import cfg from './config';
const app = express();

// Nested router for chainId
const chainRouter = express.Router();
const apiRouter = express.Router({mergeParams: true});

app.use('/', chainRouter);
app.use((err, req, res, next) => {
    if (err) {
        return res.status(500).json({ error: err.message });
    }
    next();
});

chainRouter.use('/:chainId', apiRouter);
chainRouter.route('/').get((req, res) => {
    return res.json({
        msg: 'Welcome to the Aergoscan API. Please select a chain id.',
        chains: cfg.AVAILABLE_NETWORKS.map(chainId => `${cfg.HOST}/${chainId}/`)
    });
});

chainRouter.param('chainId', function(req, res, next, chainId) {
    if (cfg.AVAILABLE_NETWORKS.indexOf(chainId) === -1) {
        return next(new Error('invalid chain id'));
    }
    req.apiClient = new ApiClient(req.params.chainId);
    next();
});

apiRouter.route('/').get((req, res) => {
    return res.json({
        id: req.params.chainId,
        msg: `Aergoscan API for chain ${req.params.chainId}.`,
        resources: ['bestBlock', 'blocks', 'transactions'].map(resource => `${cfg.HOST}/${req.params.chainId}/${resource}/`)
    });
});

/**
 * Query best block
 */
apiRouter.route('/bestBlock').get(async (req, res) => {
    try {
        return res.json(await req.apiClient.getBestBlock());
    } catch(e) {
        return res.json({error: e});
    }
});

/**
 * Query recent transactions
 */
apiRouter.route('/recentTransactions').get(async (req, res) => {
    try {
        return res.json(await req.apiClient.searchTransactions({
            match_all: {}
        }));
    } catch(e) {
        return res.json({error: e});
    }
});

/**
 * Query transactions, allow search query (q, sort, size, from)
 * For q, see https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html
 */
apiRouter.route('/transactions').get(async (req, res) => {
    try {
        return res.json(await req.apiClient.quickSearchTransactions(req.query.q, req.query.sort, parseInt(req.query.from || 0), Math.min(1000, parseInt(req.query.size || 10))));
    } catch(e) {
        return res.json({error: e});
    }
});

/**
 * Query blocks, allow search query (q, sort, size, from)
 * For q, see https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html
 */
apiRouter.route('/blocks').get(async (req, res) => {
    try {
        return res.json(await req.apiClient.quickSearchBlocks(req.query.q, req.query.sort, parseInt(req.query.from || 0), Math.min(1000, parseInt(req.query.size || 10))));
    } catch(e) {
        return res.json({error: e});
    }
});

/**
 * Query blocks, allow search query (q, sort, size, from)
 * For q, see https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html
 */
apiRouter.route('/names').get(async (req, res) => {
    try {
        return res.json(await req.apiClient.quickSearchNames(req.query.q, req.query.sort, parseInt(req.query.from || 0), Math.min(100, parseInt(req.query.size || 1))));
    } catch(e) {
        return res.json({error: e});
    }
});

/**
 * Query transactions for one account
 */
apiRouter.route('/accountTransactions').get(async (req, res) => {
    try {
        return res.json(await req.apiClient.searchTransactions({
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



/**
 * Search for tx hash, block hash, or address inside tx
 */
apiRouter.route('/search').get(async (req, res) => {
    const query = req.query.q;
    if (query.length < 5) {
        return res.json({error: "Try a longer query"});
    }
    try {
        const [
            blocks,
            transactions,
            addresses
        ] = await Promise.all([
            // Get blocks with matching hash
            req.apiClient.searchBlock({
                body: {
                    query: {
                        match: { _id: query }
                    }
                }
            }),
            // Get tx with matching hash
            req.apiClient.searchTransactions({
                match: { _id: query }
            }),
            // Get matching addresses
            req.apiClient.searchAddress(query)
        ]);

        return res.json({
            blocks,
            transactions,
            addresses
        });
    } catch(e) {
        return res.json({error: e});
    }
});

/**
 * TX stats (per minute, hour, day, month)
 */
apiRouter.route('/tx').get(async (req, res) => {
    try {
        const [
            txPerSecond,
            txPerMinute,
            txPerHour,
            txPerDay,
            txPerMonth,
            maxTps,
            bestBlock,
            blockCount
        ] = await Promise.all([
            req.apiClient.aggregateBlocks({ gte: "now-60s/s", lt: "now" }, "1s"),
            req.apiClient.aggregateBlocks({ gte: "now-60m/m", lt: "now" }, "1m"),
            req.apiClient.aggregateBlocks({ gte: "now-24h/h", lt: "now" }, "1h"),
            req.apiClient.aggregateBlocks({ gte: "now-30d/d", lt: "now" }, "1d"),
            req.apiClient.aggregateBlocks({ gte: "now-10y/y", lt: "now" }, "1M"),
            req.apiClient.searchBlock({
                body: {
                    size: 1,
                    sort: {
                        txs: { "order" : "desc" }
                    },
                }
            }, true),
            req.apiClient.getBestBlock(),
            req.apiClient.getBlockCount()
        ]);

        const txTotal = txPerMonth.map(day => day.sum_txs.value).reduce((a, b) => a + b, 0);
    
        return res.json({
            blockCount,
            maxTps,
            txTotal,
            bestBlock,
            txPerSecond,
            txPerMinute,
            txPerHour,
            txPerDay,
            txPerMonth
        })
    } catch(e) {
        return res.json({error: e});
    }
});

export default app;