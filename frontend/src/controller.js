import Aergo, { GrpcWebProvider } from '@herajs/client';
import cfg from './config.js';

function getNodeUrl() {
    try {
        // Allow to override URL manually
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('override_node') || cfg.AERGO_URL;
    } catch (e) {
        return cfg.AERGO_URL;
    }
}

const provider = new GrpcWebProvider({url: getNodeUrl()});
const aergo = new Aergo({}, provider);

export default aergo;
