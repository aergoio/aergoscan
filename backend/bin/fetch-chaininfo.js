#!/usr/bin/env node
const { exec } = require('child_process');
const { promisify } = require('util');
const { writeFile } = require('fs');
const { resolve } = require('path');

const chains = {
    'main': 'mainnet-api.aergo.io',
    'testnet': 'testnet-api.aergo.io',
}

const jsonFilePath = resolve(__dirname, '..', 'chaininfo.json');

async function main() {
    const result = {};
    for (const chain of Object.keys(chains)) {
        const host = chains[chain];
        const { stdout } = await promisify(exec)(`aergocli -H ${host} chaininfo`);
        result[chain] = JSON.parse(stdout);
    }
    console.log(JSON.stringify(result));
    await promisify(writeFile)(jsonFilePath, JSON.stringify(result));
}

main();
