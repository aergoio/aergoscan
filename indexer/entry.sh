#!/bin/sh
reindex=${AERGOSCAN_REINDEX:-false}
if [ "$reindex" = true ] ; then
    indexer -A ${AERGO_NODE} -E ${ES_URL} --prefix testnet_ --reindex 
else
    indexer -A ${AERGO_NODE} -E ${ES_URL} --prefix testnet_
fi
