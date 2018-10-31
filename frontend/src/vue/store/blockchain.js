import aergo from '../../controller';
import { Contract } from '@herajs/client';

const HISTORY_MAX_BLOCKS = 60;
const HISTORY_MAX_TRANSACTIONS = 100;

const state = {
    streamConnected: false,
    recentBlocks: [],
    recentTransactions: [],
    blocksByHash: {},
    accountsByAddress: {},
    txByHash: {},
    provider: aergo.client,
}

const getters = {

}

let blockHeaderStream = null;
let previousBlockNumber = 0;

const actions = {
    streamBlocks ({ commit, dispatch }) {
        if (blockHeaderStream !== null) {
            return;
        }
        console.log('Starting block stream');
        blockHeaderStream = aergo.getBlockStream();
        blockHeaderStream.on('data', (blockHeader) => {
            commit('addBlock', blockHeader);
            commit('setConnected', true);
        }).on('end', (res) => {
            console.log('Block stream ended, trying to reconnect in 5 seconds...');
            commit('setConnected', false);
            setTimeout(() => {
                dispatch('restartStreamBlocks');
            }, 5000);
        });
    },
    restartStreamBlocks ({ dispatch }) {
        blockHeaderStream.cancel();
        blockHeaderStream = null;
        dispatch('streamBlocks');
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
    },
    getTransaction ({ dispatch, state }, { hash }) {
        if (state.txByHash[hash]) {
            return new Promise((resolve) => {
                resolve(state.txByHash[hash]);
            }); 
        }
        return dispatch('fetchTransaction', { hash });
    },
    async fetchTransaction ({ commit }, { hash }) {
        const tx = await aergo.getTransaction(hash);
        commit('setTxDetail', { tx });
        return tx;
    },
    getTransactionReceipt ({ dispatch, state }, { hash }) {
        return dispatch('fetchTransactionReceipt', { hash });
    },
    async fetchTransactionReceipt ({ }, { hash }) {
        try {
            return await aergo.getTransactionReceipt(hash);
        } catch (e) {
            return null;
        }
    },
    getAccount ({ dispatch, state }, { address }) {
        if (state.accountsByAddress[address]) {
            return new Promise((resolve) => {
                resolve(state.accountsByAddress[address]);
            }); 
        }
        return dispatch('fetchAccount', { address });
    },
    async fetchAccount ({ commit }, { address }) {
        const account = await aergo.getState(address);
        commit('setAccountDetail', { account });
        return account;
    },
    getABI ({ dispatch }, { address }) {
        return dispatch('fetchABI', { address });
    },
    async fetchABI ({ commit }, { address }) {
        const abi = await aergo.getABI(address);
        return abi;
    },
    async fetchPeers () {
        const peers = await aergo.getPeers();
        return peers;
    },
    setProvider ({ dispatch, commit }, { provider }) {
        aergo.setProvider(provider);
        dispatch('restartStreamBlocks'); // Restart stream with new provider
        commit('setProvider', { provider });
    },
    async queryContract ({}, {abi, address, name, args}) {
         const contract = Contract.fromAbi(abi).setAddress(address);
         return await aergo.queryContract(contract[name](...args));
    }
}

const mutations = {
    addBlock (state, block) {
        // Ensure no duplicate keys
        if (state.recentBlocks.filter(b => block.hash === b.hash).length) {
            console.log('Skip adding duplicate block', block.hash);
            return;
        }

        if (block.header.blockno <= previousBlockNumber) {
            block.detectedReorg = true;
        }

        // Add block
        state.recentBlocks.push(block);
        previousBlockNumber = block.header.blockno;

        // Add block txs
        if (block.body.txsList.length) {
            block.body.txsList.forEach(tx => tx.block = block);
            state.recentTransactions.push(...block.body.txsList);
            while (state.recentTransactions.length > HISTORY_MAX_TRANSACTIONS) state.recentTransactions.shift();
        }
        
        // Limit memory usage
        while (state.recentBlocks.length > HISTORY_MAX_BLOCKS) state.recentBlocks.shift();
    },
    setBlockDetail (state, {block}) {
        state.blocksByHash[block.hash] = block;
    },
    setTxDetail (state, {tx}) {
        state.txByHash[tx.hash] = tx;
    },
    setAccountDetail (state, {account}) {
        state.accountsByAddress[account.address] = account;
    },
    setProvider (state, {provider}) {
        state.provider = provider;
    },
    setConnected (state, isConnected) {
        state.streamConnected = isConnected;
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

