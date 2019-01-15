export default {
    HTTP_PORT: 3000,
    DB_HOST: process.env.ES_HOST || 'db:9200',
    AVAILABLE_NETWORKS: ['testnet', 'chain'] // chain = testnet, may be renamed later
};