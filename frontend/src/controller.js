import Aergo, { GrpcWebProvider } from 'herajs';
//const provider = new GrpcWebProvider({url: 'http://localhost:8080/aergo'});
//const provider = new GrpcWebProvider({url: 'http://localhost:7845'});
const provider = new GrpcWebProvider({url: 'https://api.aergoscan.io/aergo'});


const aergo = new Aergo({}, provider);


export default aergo;
