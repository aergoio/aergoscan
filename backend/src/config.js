export default {
    HTTP_PORT: 3000,
    DB_HOST: process.env.elasticsearch_host || 'db:9200',
    RECREATE_INDEX: process.env.AERGOSCAN_REINDEX || false,
    AERGO_URL: process.env.AERGO_NODE || 'node:7845'
};