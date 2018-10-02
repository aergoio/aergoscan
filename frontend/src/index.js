import "./assets/style/main.scss";

import Aergo, { GrpcWebProvider } from 'herajs';
//const provider = new GrpcWebProvider({url: 'http://localhost:8080/aergo'});
const provider = new GrpcWebProvider({url: 'http://localhost:7845'});

const aergo = new Aergo({}, provider);

/*
document.addEventListener("DOMContentLoaded", function() {
    document.body.innerHTML += '<style>body {white-space: pre}</style>';
    document.body.innerHTML += "blockno   blockhash\n";

    aergo.getBlockHeaderStream().on('data', (blockHeader) => {
        const obj = blockHeader.toObject();
        document.body.innerHTML =  obj.blockno + '      ' + obj.timestamp + "\n" + document.body.innerHTML;
    });
});
*/


import setupVue from './vue/setup';

init();

async function init() {
    setupVue();
}