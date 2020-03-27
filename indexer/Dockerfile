FROM aergo/indexer
ADD entry.sh /entry.sh
RUN chmod +x /entry.sh
ENV ES_URL ${ES_URL:-http://db:9200}
ENV AERGO_NODE ${AERGO_NODE:-node:7845}
CMD ["/entry.sh"]