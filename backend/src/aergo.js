import Aergo, { GrpcProvider } from 'herajs';
import cfg from './config';

console.log(`Using aergo node at ${cfg.AERGO_URL}`);
const provider = new GrpcProvider({url: cfg.AERGO_URL});
const aergo = new Aergo({}, provider);

export default aergo;