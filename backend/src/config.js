export default {
    HTTP_PORT: 3000,
    DB_HOST: process.env.ES_HOST || 'db:9200',
    RECREATE_INDEX: ''+process.env.AERGOSCAN_REINDEX === 'true' || false,
    AERGO_URL: process.env.AERGO_NODE || 'node:7845',
    AVAILABLE_NETWORKS: ['pretestnet', 'testnet', 'chain']
};