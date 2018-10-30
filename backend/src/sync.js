import aergo from './aergo';
import { addBlocks, removeBlocks } from './db';
import asyncPool from "tiny-async-pool";

const pagesize = 100;

function delay(t, v) {
    return new Promise(function(resolve) { 
        setTimeout(resolve.bind(null, v), t)
    });
 }

const _sync = async (height, pagesize, offset) => {
    const started = + new Date();
    console.log(`[sync] Reading ${1+height-offset-pagesize}..${height-offset} ...`);
    const blockHeaders = await aergo.getBlockHeaders(height, pagesize, offset);
    if (blockHeaders.length !== pagesize) {
        console.log(`[sync] Warning: Received 0 block headers for ${1+height-offset-pagesize}..${height-offset}, expected ${pagesize}. Retrying in 5 seconds...`);
        await delay(5000);
        return await _sync(height, pagesize, offset);
    }
    const blocks = await asyncPool(10, blockHeaders, async blockHeader => await aergo.getBlock(blockHeader.hash));
    await addBlocks(blocks);
    const seconds = (new Date() - started)/1000;
    console.log(`[sync] Synced ${1+height-offset-pagesize}..${height-offset} in ${seconds.toFixed(3)}s (${(blockHeaders.length/seconds).toFixed()} blocks per second)`);
}

/**
 * Syncronize missing blocks if heightNext is bigger than heightPrev.
 * Paralized as much as possible. This reads the blockchain at ~2000 blocks per second.
 * @param {number} heightNext the expected block height in database
 * @param {number} heightPrev the actual block height in database
 */
export const syncIntermediateBlocks = async (heightNext, heightPrev) => {
    const diff = heightNext - heightPrev;
    if (diff < 0) {
        console.log(`[sync] Detected reorg (next block ${heightNext+1}, but last synced block is ${heightPrev}), removing intermediate blocks...`);
        const result = await removeBlocks(heightNext + 1, heightPrev);
        console.log(`[sync] Removed ${result.deleted} blocks in ${(result.took/1000).toFixed(3)} seconds.`);
    }
    if (diff > 0) {
        console.log(`[sync] Block meta db out of sync (missing ${diff} blocks between ${heightPrev} and ${heightNext+1}), catching up...`);
        const started = + new Date();

        const jobs = [];
        for (let offset = 0; offset < diff; offset += pagesize) {
            const targetPagesize = Math.min(pagesize, 1 + diff - offset);
            jobs.push([offset, targetPagesize]);
        }

        await asyncPool(5, jobs, async ([offset, pagesize]) => {
            return _sync(heightNext, pagesize, offset);
        });

        const seconds = (new Date() - started)/1000;
        console.log(`[sync] Finished sync in ${seconds.toFixed(3)}s (${(diff/seconds).toFixed()} blocks per second)`);
    }
}
