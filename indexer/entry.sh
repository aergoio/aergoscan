#!/bin/sh
reindex=${AERGOSCAN_REINDEX:-false}
if [ "$reindex" = true ] ; then
    esindexer -A ${AERGO_NODE} -E ${ES_URL} --prefix testnet_ --reindex 
else
    esindexer -A ${AERGO_NODE} -E ${ES_URL} --prefix testnet_
fi
