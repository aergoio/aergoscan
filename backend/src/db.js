import elasticsearch from 'elasticsearch';

import cfg from './config';

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

export class ApiClient {
    constructor(chainId = 'chain') {
        this.chainId = chainId;
        if (this.chainId === 'testnet') this.chainId = 'chain'; // TODO: remove after index was renamed
        this.BLOCK_INDEX = `${chainId}_block`;
        this.TX_INDEX = `${chainId}_tx`;
    }

    async searchBlock(opts, single = false) {
        const response = await db.search({
            requestTimeout: 5000,
            index: this.BLOCK_INDEX,
            ...opts
        });
        if (single) {
            if (response.hits.total == 0) {
                throw Error('Not found');
            }
            const item = response.hits.hits[0];
            return {hash: item._id, meta: item._source};
        } else {
            return response.hits.hits.map(item => ({hash: item._id, meta: item._source}));
        }
    }

    async quickSearchBlocks (q, sort="no", from=0, size=10) {
        const query = {
            requestTimeout: 5000,
            index: this.BLOCK_INDEX,
            q,
            sort,
            from,
            size
        };
        const response = await db.search(query);
        const resp = {
            total: response.hits.total,
            from,
            size,
            hits: response.hits.hits.map(item => ({hash: item._id, meta: item._source}))
        };
        return resp;
    }

    async searchTransactions (query, extraBody) {
        const q = {
            requestTimeout: 5000,
            index: this.TX_INDEX,
            body: {
                query,
                size: 50,
                sort: {
                    blockno: { "order" : "desc" }
                },
            }
        };
        if (extraBody) {
            Object.assign(q.body, extraBody);
        }
        const response = await db.search(q);
        return response.hits.hits.map(item => ({hash: item._id, meta: item._source}));
    }

    async quickSearchTransactions (q, sort="blockno", from=0, size=10) {
        const query = {
            requestTimeout: 5000,
            index: this.TX_INDEX,
            q,
            sort,
            from,
            size
        };
        const response = await db.search(query);
        const resp = {
            total: response.hits.total,
            from,
            size,
            hits: response.hits.hits.map(item => ({hash: item._id, meta: item._source}))
        };
        return resp;
    }

    async searchAddress (address) {
        const q = {
            requestTimeout: 2000,
            index: this.TX_INDEX,
            body: {
                aggs: {
                    address: {
                        terms: {
                            field: "to",
                            size: 1
                        }
                    }
                },
                query: {
                    match: { to: address },
                },
                size: 0,
            }
        };
        const response = await db.search(q);
        return response.aggregations.address.buckets.map(item => ({address: item.key}));
    }

    async getBestBlock () {
        return await this.searchBlock({
            body: {
                size: 1,
                sort: {
                    no: { "order" : "desc" }
                },
            }
        }, true);
    }

    async getBlockCount () {
        const { count } = await db.count({
            index: this.BLOCK_INDEX
        });
        return count;
    }

    aggregateBlocks (query, interval) {
        return new Promise(async (resolve) => {
            const response = await db.search({
                index: this.BLOCK_INDEX,
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
}