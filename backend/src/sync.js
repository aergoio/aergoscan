import aergo from './aergo';
import { addBlock } from './db';

const pagesize = 500;

export const syncIntermediateBlocks = (heightNext, heightPrev) => {
    return new Promise(async () => {
        const diff = heightNext - heightPrev;
        if (diff > 0) {
            console.log(`Block meta db out of sync (missing ${diff} blocks between ${heightPrev} and ${heightNext+1}), catching up...`);
            for (let offset = 0; offset < diff; offset += pagesize) {
                const targetPagesize = Math.min(pagesize, diff - offset);
                console.log(`Reading ${heightNext-offset}..${1+heightNext-offset-targetPagesize} ...`);
                const blocks = await aergo.getBlockHeaders(heightNext, targetPagesize, offset);
                for (let blockHeader of blocks) {
                    const block = await aergo.getBlock(blockHeader.hash);
                    console.log('Add block', block.header.blockno, block.hash);
                    addBlock(block);
                }
            }
        }
    })
}
