import BlockTracker from './tracker';
import { waitForDb, setupIndex, addBlock, getBestBlock } from './db';
import { syncIntermediateBlocks, handleReorg } from './sync';

const startup = async () => {
    await waitForDb();
    await setupIndex();

    console.log('Connected to db, starting block tracker...');

    let lastBlockHeight = 0;
    let lastBlockHash;
    try {
        const bestBlock = await getBestBlock();
        lastBlockHeight = bestBlock.meta.no;
        lastBlockHash = bestBlock.hash;
    } catch {}
    console.log('Last block in db is height', lastBlockHeight, 'hash', lastBlockHash);

    const tracker = new BlockTracker();
    tracker.on('block', async (block) => {
        if (lastBlockHeight == block.header.blockno && lastBlockHash == block.hash) {
            console.log('Skip block', block.header.blockno, block.hash);
            return;
        }
        await handleReorg(block.header.blockno - 1, lastBlockHeight);
        console.log('New block', block.header.blockno, block.hash);
        syncIntermediateBlocks(block.header.blockno - 1, lastBlockHeight);
        lastBlockHeight = block.header.blockno;
        lastBlockHash = block.hash
        addBlock(block);
    });
    tracker.start();
    setInterval(() => {
        console.log('Tracker is alive');
    }, 30000);
}

console.log('Tracker started at ' + new Date());
startup();