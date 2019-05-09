
# Quick deployment

If you quickly need a working Aergoscan on a server that already has a full Aergo node, you can use the docker-compose setup for deployment.
The performance of this won't be great, so for actual user-facing deployments it is recommended to use a proper ES cluster, static file hosting, etc.

## Prerequisites

1. Know your machine's IP address and (optionally) a hostname
2. Install Docker and docker-compose

## Setup

```console
# most cloud machines don't have enough virtual memory for elasticsearch by default
sudo sysctl -w vm.max_map_count=262144

GITHUB_TOKEN=INSERT_GITHUB_TOKEN_HERE

# get a copy of the source code
git clone https://${GITHUB_TOKEN}:@github.com/aergoio/aergoscan && cd aergoscan

# Build and run the containers, using the machine's IP.
GITHUB_TOKEN=$GITHUB_TOKEN AERGO_NODE=AERGO_NODE_IP:7845 BACKEND_URL=PUBLIC_IP_OR_HOSTNAME docker-compose up --build -d
```

Example: `GITHUB_TOKEN=$GITHUB_TOKEN AERGO_NODE=192.168.1.136:7845 BACKEND_URL=127.0.0.1 docker-compose up --build -d`

This creates the following containers:

- db: elasticsearch instance
- esindexer: indexing service connecting to AERGO_NODE and elasticsearch db
- backend: a simple node.js backend wrapping elasticsearch API
- nginx: nginx server on port 80 serving static frontend code and proxying requests to backend and AERGO_NODE

You can now access Aergoscan at PUBLIC_IP_OR_HOSTNAME.
