# aergoscan

A web application to monitor the current state of the aergo blockchain.

Can be run locally. With the launch of the testnet, a publicly accessible website will be deployed.

## Running locally

1. Install Docker if you haven't already. If you are on Linux, you may also have to install docker-compose.
2. `docker-compose up`

This contains a webserver that is accessible at http://127.0.0.1:8080

## Configuration

You can change most of the bound ports in the `docker-compose.yml` file. For example, change the nginx.ports `8080:80` to bind to another port than 8080 on your local machine.

The aergo local node can be configured using `aergo/config.toml`. After changing values, run `docker-compose build` and restart the containers.

The default configuration launches a local testnet (a block producer with a block time of 1 second) with testmode enabled (meaning balances are not verified when sending transactions). To connect to an existing network, you can also disable `enablebp` and add peers through the `npaddpeers` setting.

Alternatively you can just connect to any already running node by setting the environment variable `AERGO_NODE=ip_address:port` when building and running the containers. Make sure this address is reachable from your browser and from within the Docker container. For example

    AERGO_NODE=192.168.0.123:7845 docker-compose up --build

### Reindex meta db

After a reorg, this is currently the only way to fix the meta db:

    AERGOSCAN_REINDEX=true docker-compose up