#!/bin/sh
cd ${GOPATH}/src/github.com/aergoio/aergo-esindexer/bin
reindex=${AERGOSCAN_REINDEX:-false}
if [ "$reindex" = true ] ; then
    ./esindexer -A ${AERGO_NODE} -E ${ES_URL} --reindex
else
    ./esindexer -A ${AERGO_NODE} -E ${ES_URL}
fi
