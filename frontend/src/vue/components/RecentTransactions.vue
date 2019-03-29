<template>
  <div class="table-like">
    <div class="row header">
      <div class="cell" style="width: 75px">Time</div>
      <div class="cell" style="width: 75px">Block</div>
      <div class="cell">Hash</div>
      <div class="cell">Amount</div>
      <div class="cell"><span class="icon icon-view" style="visibility: hidden"></span></div>
      <!--<div class="cell">From -> To</div>-->
    </div>
    <transition-group name="animated-list" tag="div" class="scroll-list" style="height: 400px;">
      <div class="row" v-if="!isConnected" key="connection-status">
        <div class="cell" v-html="connectionStatusMessage"></div>
      </div>
      <div class="row clickable" v-for="tx in syncedTransactions" :key="tx.hash" v-on:click="viewTx(tx.hash)">
        <div class="cell" style="width: 75px">{{moment(tx.ts || tx.block.header.timestamp/1000000).format('HH:mm:ss')}}</div>
        <div class="cell" style="width: 75px">{{tx.blockno || tx.block.header.blockno}}</div>
        <div class="cell monospace hash">{{tx.hash}}</div>
        <div class="cell" v-html="$options.filters.formatToken(tx.amount)"></div>
        <!--<div class="cell">{{tx.body.account | shortAddress}} -> {{tx.body.recipient | shortAddress}}</div>-->
        <div class="cell"><span class="icon icon-view"></span></div>
      </div>
    </transition-group>
  </div>
</template>

<script>
import moment from 'moment';
import { mapState, mapActions } from 'vuex'
import cfg from '../../config.js';

const CONNECTING_MSG = 'Connecting...';
const CONNECTING_SLOW_MSG = 'Connecting...<br>It\'s taking longer than usual, please wait or try again later.';

export default {
  data () {
    return {
      initialTransactions: [],
      syncedTransactions: [],
      syncInterval: null
    }
  },
  created () {
  },
  async mounted () {
    this.$store.dispatch('blockchain/streamBlocks');
    this.syncTxList();
    this.syncInterval = setInterval(() => { this.syncTxList(); }, 5000);
  },
  beforeDestroy () {
    clearInterval(this.syncInterval);
  },
  computed: {
    ...mapState({
      transactions: state => state.blockchain.recentTransactions,
      isConnected: state => state.blockchain.streamConnected,
      connectionStatusMessage: state => state.blockchain.streamState === 'starting-slow' ? CONNECTING_SLOW_MSG : CONNECTING_MSG
    })
  },
  methods: {
    viewTx (hash) {
      this.$router.push({ name: 'transaction', params: { hash }});
    },
    async syncTxList() {
      const response = await this.$fetch.get(`${cfg.API_URL}/recentTransactions`);
      this.syncedTransactions = (await response.json()).map(tx => ({...tx, ...tx.meta}));
      // 2019-03-28 Workaround for errorneous data after resync
      if (this.syncedTransactions.length && this.syncedTransactions[0].blockno >= 1785804) this.syncedTransactions = [];
    },
    moment
  },
};
</script>

<style lang="scss">
</style>