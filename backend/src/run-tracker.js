import BlockTracker from './tracker';
import { waitForDb, setupIndex, addBlock, getBestBlock } from './db';
import { syncIntermediateBlocks } from './sync';

const startup = async () => {
    await waitForDb();
    await setupIndex();

    console.log('Connected to db, starting block tracker...');

    let lastBlockHeight = 0;
    try {
        const bestBlock = await getBestBlock();
        lastBlockHeight = bestBlock.meta.no;
    } catch {}
    console.log('Last block in db is height', lastBlockHeight);

    const tracker = new BlockTracker();
    tracker.on('block', async (block) => {
        console.log('New block', block.header.blockno, block.hash);
        if (lastBlockHeight == block.header.blockno) {
            console.log('Skipping already synced block');
            return;
        }
        syncIntermediateBlocks(block.header.blockno - 1, lastBlockHeight);
        lastBlockHeight = block.header.blockno;
        addBlock(block);
    });
    tracker.start();
    setInterval(() => {
        console.log('Tracker is alive');
    }, 30000);
}

console.log('Tracker started at ' + new Date());
startup();