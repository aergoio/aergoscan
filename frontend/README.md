## Local frontend development

You can build the frontend locally without re-building the docker image.

```shell
# install dependencies
yarn

# serve with hot reload at localhost:8081
yarn dev
```

### Build for production

```shell
# localhost
CONFIG_NAME=local yarn build

# mainnet
CONFIG_NAME=main yarn build

# testnet
CONFIG_NAME=prod yarn build


```

Development build with different AERGO node:

```shell
# localhost
AERGO_NODE=192.168.0.123:7845 yarn dev

# mainnet
AERGO_NODE=https://mainnet-api-http.aergo.io API_URL=https://api.aergoscan.io/main yarn dev

# testnet
AERGO_NODE=https://testnet-api-http.aergo.io API_URL=https://api.aergoscan.io/testnet yarn dev
```
