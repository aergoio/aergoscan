# Aergoscan API

This is a REST API server implemented in Node.js using Express.

The server connects to an Elasticsearch cluster that contains Aergo blockchain metadata.
Indices are populated by [aergo-esindexer](https://github.com/aergoio/aergo-esindexer).

It offers the following REST endpoints:

```
/:chainId/ - Chain info
/:chainId/bestBlock - Most recently indexed block
/:chainId/recentTransactions - List of most recent transactions
/:chainId/accountTransactions - Query transactions of one account
/:chainId/search - Search for hash or address
/:chainId/tx - Get transaction statistics (per minute, hour, day etc.)
```