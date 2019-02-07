let BACKEND_URL = 'http://127.0.0.1:8080';

let API_URL = `${BACKEND_URL}/api/chain`;
if (process.env.API_URL) {
    if (process.env.API_URL.startsWith('http')) {
        API_URL = process.env.API_URL;
    } else {
        API_URL = `http://${process.env.API_URL}`;
    }
}

let AERGO_URL = `${BACKEND_URL}/aergo`;
if (process.env.AERGO_NODE) {
    if (process.env.API_URL.startsWith('http')) {
        API_URL = process.env.AERGO_NODE;
    } else {
        const aergo_node_clean = process.env.AERGO_NODE.replace(/https?:\/\//,'');
        AERGO_URL = `http://${aergo_node_clean}`;
    }
}

module.exports = {
    NODE_ENV: JSON.stringify('development'),
    API_URL: JSON.stringify(API_URL),
    AERGO_URL: JSON.stringify(AERGO_URL),
}