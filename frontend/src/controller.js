import Aergo, { GrpcWebProvider } from 'herajs';
//const provider = new GrpcWebProvider({url: 'http://localhost:8080/aergo'});
const provider = new GrpcWebProvider({url: 'http://localhost:7845'});

const aergo = new Aergo({}, provider);

export default aergo;
