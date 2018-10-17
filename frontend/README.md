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
CONFIG_NAME=prod npm run build
```

Development build with different AERGO node:

```shell
AERGO_NODE=192.168.0.123:7845 npm run dev
```