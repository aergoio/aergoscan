const API_URL = 'http://127.0.0.1:8080';
let AERGO_URL = `${API_URL}/aergo`;
if (process.env.AERGO_NODE) {
    const aergo_node_clean = process.env.AERGO_NODE.replace(/https?:\/\//,'');
    AERGO_URL = `http://${aergo_node_clean}`;
}

module.exports = {
    NODE_ENV: JSON.stringify('development'),
    API_URL: JSON.stringify(API_URL),
    AERGO_URL: JSON.stringify(AERGO_URL),
}