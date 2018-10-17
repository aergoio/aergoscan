import aergo from './aergo';
import { addBlocks } from './db';
import asyncPool from "tiny-async-pool";

const pagesize = 1000;

const _sync = async (height, pagesize, offset) => {
    const started = + new Date();
    console.log(`Reading ${1+height-offset-pagesize}..${height-offset} ...`);
    const blockHeaders = await aergo.getBlockHeaders(height, pagesize, offset);
    const blocks = await asyncPool(10, blockHeaders, async blockHeader => await aergo.getBlock(blockHeader.hash));
    await addBlocks(blocks);
    const seconds = (new Date() - started)/1000;
    console.log(`Synced ${1+height-offset-pagesize}..${height-offset} in ${seconds}s (${(blockHeaders.length/seconds).toFixed()} blocks per second)`);
}

/**
 * Syncronize missing blocks if heightNext is bigger than heightPrev.
 * Paralized as much as possible. This reads the blockchain at ~2000 blocks per second.
 * @param {number} heightNext the expected block height in database
 * @param {number} heightPrev the actual block height in database
 */
export const syncIntermediateBlocks = async (heightNext, heightPrev) => {
    const diff = heightNext - heightPrev;
    if (diff > 0) {
        console.log(`Block meta db out of sync (missing ${diff} blocks between ${heightPrev} and ${heightNext+1}), catching up...`);
        const started = + new Date();

        const jobs = [];
        for (let offset = 0; offset < diff; offset += pagesize) {
            const targetPagesize = Math.min(pagesize, 1 + diff - offset);
            jobs.push([offset, targetPagesize]);
        }

        await asyncPool(3, jobs, async ([offset, pagesize]) => {
            return _sync(heightNext, pagesize, offset);
        });

        const seconds = (new Date() - started)/1000;
        console.log(`Finished sync in ${seconds}s (${(diff/seconds).toFixed()} blocks per second)`);
    }
}
