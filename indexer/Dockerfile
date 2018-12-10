FROM golang:alpine as builder
RUN apk update && apk add git glide build-base
ENV GOPATH $HOME/go
RUN go get -d github.com/aergoio/aergo-esindexer && cd ${GOPATH}/src/github.com/aergoio/aergo-esindexer && git submodule init && git submodule update && make all
WORKDIR ${GOPATH}/src/github.com/aergoio/aergo-esindexer/build
ENV ES_URL ${ES_URL:-http://db:9200}
ENV AERGO_NODE ${AERGO_NODE:-node:7845}
ADD entry.sh /entry.sh
RUN chmod +x /entry.sh
CMD ["/entry.sh"]