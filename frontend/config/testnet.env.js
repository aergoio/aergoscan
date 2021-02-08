let BACKEND_URL = 'https://api.aergoscan.io';
if (process.env.BACKEND_URL) {
    if (process.env.BACKEND_URL.startsWith('http')) {
        BACKEND_URL = process.env.BACKEND_URL;
    } else {
        BACKEND_URL = `http://${process.env.BACKEND_URL}`;
    }
}

let AERGO_URL = `https://testnet-api-http.aergo.io`;
if (process.env.AERGO_URL) {
    if (process.env.AERGO_URL.startsWith('http')) {
        AERGO_URL = process.env.AERGO_URL;
    } else {
        const aergo_node_clean = process.env.AERGO_URL.replace(/https?:\/\//,'');
        AERGO_URL = `https://${aergo_node_clean}/aergo`;
    }
}

module.exports = {
    DEPLOYMENT: JSON.stringify('testnet'),
    NODE_ENV: JSON.stringify('production'),
    API_URL: JSON.stringify(`${BACKEND_URL}/testnet`),
    AERGO_URL: JSON.stringify(`${AERGO_URL}`),
}