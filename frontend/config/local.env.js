let BACKEND_URL = 'http://127.0.0.1:8080';

let API_URL = `${BACKEND_URL}/api/testnet`;
if (process.env.API_URL) {
    if (process.env.API_URL.startsWith('http')) {
        API_URL = process.env.API_URL;
    } else {
        API_URL = `http://${process.env.API_URL}`;
    }
}

let AERGO_URL = `${BACKEND_URL}/aergo`;
if (process.env.AERGO_NODE) {
    if (process.env.AERGO_NODE.startsWith('http')) {
        AERGO_URL = process.env.AERGO_NODE;
    } else {
        const aergo_node_clean = process.env.AERGO_NODE.replace(/https?:\/\//,'');
        AERGO_URL = `http://${aergo_node_clean}`;
    }
}

if (process.env.AERGO_URL) {
    if (process.env.AERGO_URL.startsWith('http')) {
        AERGO_URL = process.env.AERGO_URL;
    } else {
        const aergo_node_clean = process.env.AERGO_URL.replace(/https?:\/\//,'');
        AERGO_URL = `http://${aergo_node_clean}`;
    }
}

module.exports = {
    DEPLOYMENT: JSON.stringify('local'),
    NODE_ENV: JSON.stringify('development'),
    API_URL: JSON.stringify(API_URL),
    AERGO_URL: JSON.stringify(AERGO_URL),
}