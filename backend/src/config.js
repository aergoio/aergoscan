export default {
    HTTP_PORT: 3000,
    DB_HOST: process.env.ES_HOST || 'db:9200',
    AVAILABLE_NETWORKS: ['testnet', 'chain', 'main'], // chain = testnet, may be renamed later
    HOST: 'https://api.aergoscan.io'
};