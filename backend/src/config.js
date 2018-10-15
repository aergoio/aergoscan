export default {
    HTTP_PORT: 3000,
    DB_HOST: process.env.elasticsearch_host || 'db:9200',
    RECREATE_INDEX: false,
    AERGO_URL: process.env.aergo_url || 'node:7845'
};