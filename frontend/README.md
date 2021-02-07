## Local frontend development

You can build the frontend locally without re-building the docker image.

```shell
# install dependencies
npm install

# serve with hot reload at localhost:8081
npm run dev
```

### Build for production

```shell
# localhost
CONFIG_NAME=local npm run build

# mainnet
CONFIG_NAME=main npm run build

# testnet
CONFIG_NAME=prod npm run build


```

Development build with different AERGO node:

```shell
# localhost
AERGO_NODE=192.168.0.123:7845 npm run dev

# mainnet
AERGO_NODE=https://mainnet-api-http.aergo.io API_URL=https://api.aergoscan.io/main npm run dev

# testnet
AERGO_NODE=https://testnet-api-http.aergo.io API_URL=https://api.aergoscan.io/testnet npm run dev
```
