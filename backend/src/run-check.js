import { db, addBlock, DB_BLOCK_INDEX } from './db';
import aergo from './aergo';

async function main() {
  const responseQueue = [];
  const duplicateBlocks = [];
  const missingBlocks = [];
  const filter_path = '_scroll_id, hits.hits._id, hits.hits._source.no, hits.total';

  responseQueue.push(
    await db.search({
      index: 'block_meta',
      scroll: '1m',
      filter_path,
      body: {
        size: 10000,
        query: {
          match_all: {}
        },
        sort: {
          no: { order : "asc" }
        },
        _source: ['no']
      }
    })
  );

  let lastBlockNumber = -1;
  let totalBlocks = 0;

  while (true) {
    const response = responseQueue.shift()

    if (typeof response.hits.hits === 'undefined' || !response.hits.hits.length) break;

    console.log(`${totalBlocks}/${response.hits.total} ...`);

    response.hits.hits.forEach(hit => {
      lastBlockNumber++;
      totalBlocks++;
      if (lastBlockNumber > hit._source.no) {
        console.log(`Consistency error, duplicate block ${hit._source.no} (expected ${lastBlockNumber})`);
        duplicateBlocks.push(hit._source.no);
        lastBlockNumber = hit._source.no;
      }
      if (lastBlockNumber < hit._source.no) {
        console.log(`Consistency error, missing blocks ${lastBlockNumber}..${hit._source.no}`);
        for (let i = lastBlockNumber; i < hit._source.no; i++) {
          missingBlocks.push(i);
        }
        lastBlockNumber = hit._source.no;
      }
    });

    responseQueue.push(
      await db.scroll({
        scrollId: response._scroll_id,
        scroll: '1m',
        filter_path
      })
    );
  }

  console.log(`Total ${totalBlocks} blocks, ${missingBlocks.length} missing, ${duplicateBlocks.length} duplicate.`);
  console.log('Removing duplicate blocks with numbers ', duplicateBlocks);
  const result = await db.deleteByQuery({
    index: DB_BLOCK_INDEX,
    type: 'block',
    body: {
      query: {
        terms: { no: duplicateBlocks }
      }
    }
  });
  console.log(`Removed ${result.deleted} blocks in ${(result.took/1000).toFixed(3)} seconds.`);
  
  console.log('Adding missing blocks...');
  for (var blockNo of [...duplicateBlocks, ...missingBlocks]) {
    const block = await aergo.getBlock(blockNo);
    console.log(blockNo, block.hash);
    try {
      await addBlock(block);
    } catch(e) {
      console.log('Already exists');
    }
  }
}
main()
