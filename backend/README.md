# Aergoscan API

This is a REST API server implemented in Node.js using Express.

The server connects to an Elasticsearch cluster that contains Aergo blockchain metadata.
Indices are populated by [aergo-esindexer](https://github.com/aergoio/aergo-esindexer).

It offers the following REST endpoints:

```
/:chainId/ - Chain info
/:chainId/bestBlock - Most recently indexed block
/:chainId/recentTransactions - List of most recent transactions
/:chainId/accountTransactions?address=aergo.system - Query transactions of one account (sender or recipient)
/:chainId/search - Search for hash or address
/:chainId/tx - Get transaction statistics (per minute, hour, day etc.)
```

Custom search endpoints

```
/:chainId/transactions - Search for transactions
/:chainId/blocks - Search for blocks
```

Search endpoints support the query params `q`, `sort`, `from` and `size`.
These are passed directly to elasticsearch.
For the documentation about `q`, see [this article](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html).

Example: https://api.aergoscan.io/chain/transactions?q=type:1&sort=blockno:desc