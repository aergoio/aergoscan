# aergoscan

A web application to monitor the current state of the aergo blockchain.

Can be run locally. You can find the deployed application at http://aergoscan.io

The docker-compose file included in this repo is not meant for production use.

## Running locally

1. Install Docker if you haven't already. If you are on Linux, you may also have to install docker-compose.
2. `docker-compose up`

This will start a webserver, API backend, and blockchain indexer.

If you also want a local Aergo testnet with zero configuration, try `docker-compose -f docker-compose.yml -f docker-compose.node.yml up`.

The webserver is accessible at http://127.0.0.1:8080

## Configuration

You can change most of the bound ports in the `docker-compose.yml` file. For example, change the nginx.ports `8080:80` to bind to another port than 8080 on your local machine.

The aergo local node can be configured using `aergo/config.toml`. After changing values, run `docker-compose build` and restart the containers.

The default configuration launches a local testnet (a block producer with a block time of 1 second) with testmode enabled (meaning balances are not verified when sending transactions). To connect to an existing network, you can also disable `enablebp` and add peers through the `npaddpeers` setting.

Alternatively you can just connect to any already running node by setting the environment variable `AERGO_NODE=ip_address:port` when building and running the containers. Make sure this address is reachable from your browser and from within the Docker container. Again, don't forget to build. For example

    AERGO_NODE=192.168.0.123:7845 docker-compose up --build

### Reindex meta db

This contains an indexer that syncs a database with blockchain meta data. It attempts to sync correctly even during reorganizations,
but sometimes it can fail. In that case you can resync the database by starting the indexer with `AERGOSCAN_REINDEX=true`.

    AERGOSCAN_REINDEX=true docker-compose up

### Scripts for testing

```console
# Start a node with specified version, in testmode (optional)
docker run --rm -p 7845:7845 -v /path/to/aergo/home/:/aergo/ aergo/node:0.8.1 aergosvr --config /aergo/config.toml --testmode

# Start aergoscan listening on that node
AERGO_NODE=192.168.0.123:7845 AERGOSCAN_REINDEX=true docker-compose up --build
```

Wait until `indexer` is connected to the node (new blocks are being shown in the log), then open 127.0.0.1:8080 in the browser and create some test transactions.

### Quick deployment

If you just quickly need a working Aergoscan on a server that already has a fullnode, you can also use the docker-compose setup for deployment.
The performance of this won't be great, so for actual user-facing deployments it is recommended to use a proper ES cluster, static file hosting, etc.

```console
# most cloud machines don't have enough virtual memory for elastic search by default
sudo sysctl -w vm.max_map_count=262144

# clone this repo
git clone https://github.com/aergoio/aergoscan && cd aergoscan

# Edit docker-compose.yml port bindings (i.e. put nginx at 80:80, and remove the public ports of the db)
vim docker-compose.yml

# Run the containers, using the machine's IP.
AERGO_NODE=MACHINE_IP:7845 API_URL=MACHINE_IP/stats/chain docker-compose up --build -d
```

If you want a hostname, you have to edit the nginx/localhost.conf file before building the containers and then use the hostname instead of the MACHINE_IP in the above command.