import Aergo, { GrpcWebProvider } from '@herajs/client';
import cfg from './config.js';
const provider = new GrpcWebProvider({url: cfg.AERGO_URL});
const aergo = new Aergo({}, provider);

export default aergo;
