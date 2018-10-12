import BlockTracker from './tracker.js';
import { waitForDb, setupIndex, addBlock, getBestBlock } from './db';
import { syncIntermediateBlocks } from './sync';
import app from './app';
import cfg from './config';

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

    app.listen(cfg.HTTP_PORT, () => console.log(`Backend listening on port ${cfg.HTTP_PORT}.`))
}

startup();

