FROM golang:alpine as builder
RUN apk update && apk add git glide build-base
ENV GOPATH $HOME/go
RUN go get -d github.com/aergoio/aergo-esindexer
WORKDIR ${GOPATH}/src/github.com/aergoio/aergo-esindexer
ENV INDEXER_GIT_TAG 7fd12f19ec28efe8530ccd82e7ab5a395f7edb38
RUN git fetch && git checkout ${INDEXER_GIT_TAG} && git submodule init && git submodule update
RUN make all

FROM alpine:3.8
RUN apk add libgcc
COPY --from=builder $HOME/go/src/github.com/aergoio/aergo-esindexer/bin/* /usr/local/bin/
ADD entry.sh /entry.sh
RUN chmod +x /entry.sh
ENV ES_URL ${ES_URL:-http://db:9200}
ENV AERGO_NODE ${AERGO_NODE:-node:7845}
CMD ["/entry.sh"]