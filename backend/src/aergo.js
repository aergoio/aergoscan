import Aergo, { GrpcProvider } from 'herajs';

const provider = new GrpcProvider({url: 'node:7845'});
const aergo = new Aergo({}, provider);

export default aergo;