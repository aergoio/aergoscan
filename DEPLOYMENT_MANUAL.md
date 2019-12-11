## How to build Aergoscan and deploy remotely (manually)

```shell
# Config

GITHUB_TOKEN=INSERT_GITHUB_TOKEN_HERE
AERGO_NODE=192.168.50.136:7845
BACKEND_URL=http://192.168.50.136

# First time, clone github repo

git clone https://${GITHUB_TOKEN}:@github.com/aergoio/aergoscan && cd aergoscan

# Build

GITHUB_TOKEN=$GITHUB_TOKEN AERGO_NODE=$AERGO_NODE BACKEND_URL=$BACKEND_URL docker-compose build

# Save images into tar.gz

docker save aergoscan_backend aergoscan_nginx aergoscan_indexer docker.elastic.co/elasticsearch/elasticsearch:6.4.2 | gzip > aergoscan-images.tar.gz

# Now transfer to other computer


# On other computer, we need this config again

AERGO_NODE=192.168.50.136:7845

# Load images

docker load -i aergoscan-images.tar.gz

# Create network and volume

docker network create --driver bridge aergoscan

docker volume create --name esdata

# Run images

docker run -dit --name db --network aergoscan -v esdata:/usr/share/elasticsearch/data docker.elastic.co/elasticsearch/elasticsearch:6.4.2 elasticsearch -Elogger.level=WARN

docker run -dit --name backend --network aergoscan --env AERGO_NODE=$AERGO_NODE aergoscan_backend 

docker run -dit --name indexer --network aergoscan --env AERGO_NODE=$AERGO_NODE aergoscan_indexer 

docker run -dit --name nginx --network aergoscan -p 80:80 aergoscan_nginx
```

## How to update

For updates, you need to repeat almost all of these steps, except for creating the network and volume. Before running the new images, simply stop and remove the old containers.

## How to change the port

In the last line, change `80:80` to `12345:80`. Also, you need to add the port to BACKEND_URL, e.g. `http://192.168.50.136:12345` and BUILD again.
