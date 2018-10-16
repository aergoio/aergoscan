//const API_URL = process.env.aergoscan_api_url || 'http://127.0.0.1:8080'; //FIXME
const API_URL = process.env.aergoscan_api_url || 'https://api.aergoscan.io';

export default {
    API_URL,
    AERGO_URL: `${API_URL}/aergo`
};