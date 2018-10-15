# aergoscan

A web application to monitor the current state of the aergo blockchain.

Can be run locally. With the launch of the testnet, a publicly accessible website will be deployed.

## Run

This app is packaged using docker-compose. If you haven't, install Docker first. Then run

    docker-compose up

Finally, access the website at http://127.0.0.1:8080

## Configuration

The aergo local node can be configured using `aergo/config.toml`. After changing values, run `docker-compose build` and restart the containers.

The default configuration launches a local testnet (a block producer with a block time of 1 second) with testmode enabled (meaning balances are not verified when sending transactions). To connect to an existing network, you can instead disable `enablebp` and add peers through the `npaddpeers` setting.
