
# Quick deployment

If you just quickly need a working Aergoscan on a server that already has a full Aergo node, you can use the docker-compose setup for deployment.
The performance of this won't be great, so for actual user-facing deployments it is recommended to use a proper ES cluster, static file hosting, etc.

## Prerequisites

1. Know your machine's IP address
2. Install Docker and docker-compose

## Setup

```console
# most cloud machines don't have enough virtual memory for elastic search by default
sudo sysctl -w vm.max_map_count=262144

# clone this repo
git clone https://github.com/aergoio/aergoscan && cd aergoscan

# Edit docker-compose.yml port bindings to your liking
# (e.g. put nginx at 80:80, and remove the public ports of the db)
vim docker-compose.yml

# Build and run the containers, using the machine's IP.
AERGO_NODE=MACHINE_IP:7845 CONFIG_NAME=prod BACKEND_URL=MACHINE_IP docker-compose up --build -d
```

You can now access Aergoscan at MACHINE_IP.

## Hostname setup

If you want a hostname, you have to edit the `nginx/localhost.conf` file before building the containers and then use the hostname instead of the MACHINE_IP in the above command's BACKEND_URL.

Example:

```console
AERGO_NODE=MACHINE_IP:7845 CONFIG_NAME=prod BACKEND_URL=https://hostname.tld docker-compose up --build -d
```