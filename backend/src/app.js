import express from 'express';
import cors from 'cors';
import { Amount } from '@herajs/client';
import { ApiClient } from './db';
import cfg from './config';
import chaininfos from '../chaininfo';
import fetch from 'node-fetch';
const app = express();

app.use(cors({credentials: true, origin: 'http://localhost:8081'}));

const TokenCache = new Map();

// Nested router for chainId
const chainRouter = express.Router();
const apiRouter = express.Router({mergeParams: true});

const cache = {
    swapData: null,
    swapDataUpdated: null,
};

app.use('/', chainRouter);
app.use((err, req, res, next) => {
    if (err) {
        return res.status(500).json({ error: err.message });
    }
    next();
});

chainRouter.route('/').get((req, res) => {
    return res.json({
        msg: 'Welcome to the Aergoscan API. Please select a chain id.',
        chains: cfg.AVAILABLE_NETWORKS.map(chainId => `${cfg.HOST}/${chainId}/`)
    });
});

chainRouter.route('/swapStat').get(async (req, res) => {
    const swapStatCacheDuration = 60 * 60 * 24 * 1000;
    const isStale = cache.swapDataUpdated && (new Date() - cache.swapDataUpdated) > swapStatCacheDuration;
    if (!cache.swapData || isStale) {
        const url = 'https://vb42nx03yf.execute-api.us-east-1.amazonaws.com/prod';
        try {
            const response = await fetch(url);
            cache.swapData = await response.json();
            cache.swapDataUpdated = new Date();
        } catch(e) {
            return res.json({error: 'Could not fetch data'});
        }
    }
    return res.json({ updated: cache.swapDataUpdated, result: cache.swapData });
});

chainRouter.param('chainId', function(req, res, next, chainId) {
    if (cfg.AVAILABLE_NETWORKS.indexOf(chainId) === -1) {
        return next(new Error('invalid chain id'));
    }
    req.apiClient = new ApiClient(req.params.chainId);
    next();
});

chainRouter.use('/:chainId', apiRouter);

apiRouter.route('/').get((req, res) => {
    const publicEndpoints = ['chaininfo', 'bestBlock', 'blocks', 'transactions', 'names', 'rewards', 'token', 'tokenTransfers'];
    return res.json({
        id: req.params.chainId,
        msg: `Aergoscan API for chain ${req.params.chainId}.`,
        resources: publicEndpoints.map(resource => `${cfg.HOST}/${req.params.chainId}/${resource}/`)
    });
});

apiRouter.route('/chaininfo').get((req, res) => {
    const chaininfo = chaininfos[req.params.chainId];
    if (!chaininfo) {
        return res.json({ error: 'chaininfo not found' });
    }
    return res.json(chaininfo);
});

apiRouter.route('/maxTokens').get((req, res) => {
    const chaininfo = chaininfos[req.params.chainId];
    if (!chaininfo) {
        return res.send('chaininfo not found');
    }
    const unit = req.query.unit || 'aer';
    const amount = new Amount(chaininfo['MaxTokens'], 'aer');
    const [value,] = amount.toUnit(unit).toString().split(" ");
    return res.send(value);
});

apiRouter.route('/totalTokens').get((req, res) => {
    if (req.params.chainId !== 'main') res.send(`not available for chain ${req.params.chainId}`);
    const unit = req.query.unit || 'aer';
    const amount = new Amount("0", 'aergo');
    const [value,] = amount.toUnit(unit).toString().split(" ");
    return res.send(value);
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

async function fetchToken(apiClient, address) {
    const result = await apiClient.quickSearchToken(`_id:${address}`);
    if (result.hits && result.hits.length) {
        return result.hits[0];
    }
    return null;
}

function getCachedToken(apiClient, address) {
    const token = TokenCache.get(address);
    if (token) {
        return token;
    }
    const fetch = fetchToken(apiClient, address);
    TokenCache.set(address, fetch);
    return fetch;
}

async function addCachedTokenData(apiClient, hit) {
    hit.token = await getCachedToken(apiClient, hit.meta.address);
    return hit;
}

/**
 * Query token transfers, allow search query (q, sort, size, from)
 * For q, see https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html
 */
 apiRouter.route('/tokenTransfers').get(async (req, res) => {
    try {
        const result = await req.apiClient.quickSearchTokenTransfers(req.query.q, req.query.sort, parseInt(req.query.from || 0), Math.min(1000, parseInt(req.query.size || 10)));
        if (result.hits && result.hits.length) {
            result.hits = await Promise.all(result.hits.map(hit => addCachedTokenData(req.apiClient, hit)))
        }
        return res.json(result);
    } catch(e) {
        return res.json({error: e});
    }
});

/**
 * Query token transfers, allow search query (q, sort, size, from)
 * For q, see https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html
 */
 apiRouter.route('/token').get(async (req, res) => {
    try {
        return res.json(await req.apiClient.quickSearchToken(req.query.q, req.query.sort, parseInt(req.query.from || 0), Math.min(1000, parseInt(req.query.size || 10))));
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
 * Query distinct accounts with most recent transaction
 */
apiRouter.route('/accounts').get(async (req, res) => {
    try {
        async function makeQuery(field) {
            const result = await req.apiClient.searchTransactionsRaw({
                "match_all": {}
            }, {
                size: 0,
                aggs: {
                    // DISTINCT(field = [from, to])
                    address_unique: {
                        terms: {
                            field,
                            size: 25,
                            order: { max_blockno: 'desc' }
                        },
                        aggs: {
                            tx: { top_hits: {
                                size: 1,
                                sort: { blockno: 'desc' },
                                _source: { include: ['ts'] }
                            }},
                            max_blockno: {
                                max: {
                                    field: "blockno"
                                }
                            }
                        }
                    }
                }
            }, {
                filterPath: [
                    'aggregations.address_unique.buckets.key',
                    'aggregations.address_unique.buckets.max_blockno',
                    'aggregations.address_unique.buckets.doc_count',
                    'aggregations.address_unique.buckets.tx.hits.hits._id',
                    'aggregations.address_unique.buckets.tx.hits.hits._source.ts',
                ],
            })
            return result.aggregations.address_unique.buckets;
        }
        function convBucket(bucket) {
            return {
                ...bucket,
                max_blockno: bucket.max_blockno.value,
                tx: {
                    hash: bucket.tx.hits.hits[0]._id,
                    ts: bucket.tx.hits.hits[0]._source.ts,
                }
            }
        }
        const sort = 'max_blockno';
        const queryFrom = makeQuery('from', sort);
        const queryTo = makeQuery('to', sort);
        const [resultsFrom, resultsTo] = await Promise.all([queryFrom, queryTo]);
        const merged = new Map();
        for (let obj of resultsFrom) {
            merged.set(obj.key, convBucket(obj));
        };
        for (let obj of resultsTo) {
            const hasAddress = merged.has(obj.key);
            // Add to merged list if missing or newer
            if (!hasAddress) {
                merged.set(obj.key, convBucket(obj));
            } else {
                const otherObj = merged.get(obj.key);
                const convObj = convBucket(obj);
                merged.set(obj.key, {
                    ... ( otherObj.max_blockno < obj.max_blockno ? convObj : otherObj),
                    doc_count: convObj.doc_count + otherObj.doc_count
                });
            }
        }
        return res.json({ objects: Array.from(merged.values()).sort((a, b) => b[sort] - a[sort]) });
    } catch(e) {
        console.log(e);
        return res.json({error: ''+e});
    }
});

/**
 * Query distinct token balances for account
 */
 apiRouter.route('/accountTokens').get(async (req, res) => {
    try {
        async function makeQuery(value) {
            const result = await req.apiClient.searchTokenTransfersRaw({
                match: {
                    to: {
                        query: value
                    }
                }
            }, {
                size: 0,
                aggs: {
                    address_unique: {
                        terms: {
                            field: 'address',
                            size: 100,
                            order: { max_blockno: 'desc' }
                        },
                        aggs: {
                            transfer: { top_hits: {
                                size: 1,
                                sort: { blockno: 'desc' },
                                _source: { include: ['ts', 'blockno'] }
                            }},
                            max_blockno: {
                                max: {
                                    field: "blockno"
                                }
                            }
                        }
                    }
                }
            }, {
                filterPath: [
                    'aggregations.address_unique.buckets.key',
                    'aggregations.address_unique.buckets.doc_count',
                    'aggregations.address_unique.buckets.transfer.hits.hits._source.ts',
                    'aggregations.address_unique.buckets.transfer.hits.hits._source.blockno',
                ],
            })
            if (!result.aggregations) return [];
            return result.aggregations.address_unique.buckets;
        }
        async function convBucket(bucket) {
            const token = await getCachedToken(req.apiClient, bucket.key);
            if (!token) return null;
            return {
                ...bucket,
                token,
                transfer: bucket.transfer.hits.hits[0]._source
            }
        }
        const sort = 'max_blockno';
        const results = await makeQuery(req.query.address);
        const mapped = await Promise.all(results.map(convBucket));
        return res.json({ objects: mapped.filter(a => a).sort((a, b) => b[sort] - a[sort]) });
    } catch(e) {
        console.log(e);
        return res.json({error: ''+e});
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

/**
 * Reward stats
 */
apiRouter.route('/rewards').get(async (req, res) => {
    const address = req.query.address;
    if (!address) {
        return res.json({error: 'no address given'});
    }
    try {
        const [
            blockPerDay,
            //blockPerMonth,
            blockCount
        ] = await Promise.all([
            req.apiClient.aggregateBlocks({ gte: "now-30d/d", lt: "now" }, "1d", {}, [{ term: { reward_account: address }}]),
            //req.apiClient.aggregateBlocks({ gte: "now-10y/y", lt: "now" }, "1M", {}, [{ term: { reward_account: address }}]),
            req.apiClient.getBlockCount(`reward_account:${address}`)
        ]);
        return res.json({
            blockCount,
            blockPerDay,
            //blockPerMonth,
        })
    } catch(e) {
        return res.json({error: e});
    }
});

export default app;