export default {
    HTTP_PORT: 3000,
    DB_HOST: process.env.ES_HOST || 'db:9200',
    AVAILABLE_NETWORKS: ['pretestnet', 'testnet', 'chain']
};