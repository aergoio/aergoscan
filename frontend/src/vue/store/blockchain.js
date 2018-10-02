import { promisifySimple } from '../../utils/promisify';
import aergo from '../../controller';

const HISTORY_MAX_BLOCKS = 5;


const state = {
    blocks: [],
    blocksByHash: {}
}

const getters = {

}

let blockHeaderStream = null;

const actions = {
    streamBlocks ({ commit }) {
        if (blockHeaderStream !== null) {
            return;
        }
        blockHeaderStream = aergo.getBlockHeaderStream();
        blockHeaderStream.on('data', (blockHeader) => {
            const block = blockHeader.toObject();
            commit('addBlock', block);
        });
    },
    getBlock ({ dispatch, state }, { blockNoOrHash }) {
        if (state.blocksByHash[blockNoOrHash]) {
            return new Promise((resolve) => {
                resolve(state.blocksByHash[blockNoOrHash]);
            }); 
        }
        return dispatch('fetchBlock', { blockNoOrHash });
    },
    async fetchBlock ({ commit }, { blockNoOrHash }) {
        const block = await aergo.getBlock(blockNoOrHash);
        commit('setBlockDetail', { block });
        return block;
    }
}

const mutations = {
    addBlock (state, block) {
        state.blocks.push(block);
        state.blocks.splice(0, state.blocks.length - HISTORY_MAX_BLOCKS);
    },
    setBlockDetail (state, {block}) {
        state.blocksByHash[block.hash] = block;
    }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}





// blocks

// tx?

