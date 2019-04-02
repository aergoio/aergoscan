let BACKEND_URL = 'https://api.aergoscan.io';
if (process.env.BACKEND_URL) {
    if (process.env.BACKEND_URL.startsWith('http')) {
        BACKEND_URL = process.env.BACKEND_URL;
    } else {
        BACKEND_URL = `http://${process.env.BACKEND_URL}`;
    }
}

let API_URL = `${BACKEND_URL}/api/mainnet`;
if (process.env.API_URL) {
    if (process.env.API_URL.startsWith('http')) {
        API_URL = process.env.API_URL;
    } else {
        API_URL = `http://${process.env.API_URL}/mainnet`;
    }
}

let AERGO_URL = `${BACKEND_URL}/aergo`;
if (process.env.AERGO_NODE) {
    if (process.env.AERGO_NODE.startsWith('http')) {
        AERGO_URL = process.env.AERGO_NODE;
    } else {
        const aergo_node_clean = process.env.AERGO_NODE.replace(/https?:\/\//,'');
        AERGO_URL = `https://${aergo_node_clean}/aergo`;
    }
}

module.exports = {
    NODE_ENV: JSON.stringify('production'),
    API_URL: JSON.stringify(`${API_URL}`),
    AERGO_URL: JSON.stringify(`${AERGO_URL}`),
}