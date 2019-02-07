let BACKEND_URL = 'https://api.aergoscan.io';
if (process.env.BACKEND_URL) {
    if (process.env.BACKEND_URL.startsWith('http')) {
        BACKEND_URL = process.env.BACKEND_URL;
    } else {
        BACKEND_URL = `http://${process.env.BACKEND_URL}`;
    }
}

module.exports = {
    NODE_ENV: JSON.stringify('production'),
    API_URL: JSON.stringify(`${BACKEND_URL}/testnet`),
    AERGO_URL: JSON.stringify(`${BACKEND_URL}/aergo`),
}