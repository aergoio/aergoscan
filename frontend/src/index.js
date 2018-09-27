import Aergo, { GrpcWebProvider } from 'herajs';
const provider = new GrpcWebProvider({url: 'http://localhost:8080/aergo'});

const aergo = new Aergo({}, provider);

async function update() {
    const blockchain = await aergo.blockchain();
    document.body.innerHTML +=  blockchain.bestHeight + '      ' + blockchain.bestBlockHash + "\n";
    setTimeout(update, 1000);
}

document.addEventListener("DOMContentLoaded", function() {
    document.body.innerHTML += '<style>body {white-space: pre}</style>';
    document.body.innerHTML += "blockno   blockhash\n";
    update();
});
