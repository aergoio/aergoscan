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
    <transition-group name="animated-list" tag="div" style="height: 400px; overflow: auto;">
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

export default {
  data () {
    return {
      initialTransactions: [],
      syncedTransactions: [],
      syncInterval: null,
      connectionStatusMessage: 'Connecting...'
    }
  },
  created () {
  },
  async mounted () {
    this.$store.dispatch('blockchain/streamBlocks');
    setTimeout(this.checkConnection, 3000);
    const response = await this.$fetch.get(`${cfg.API_URL}/stats/recentTransactions`);
    this.initialTransactions = (await response.json()).map(tx => ({...tx, ...tx.meta}));
    this.syncTxList();
    this.syncInterval = setInterval(() => { this.syncTxList(); }, 5000);
  },
  beforeDestroy () {
    clearInterval(this.syncInterval);
  },
  watch: {
    isConnected: function(val) {
      if (!this.isConnected) {
        setTimeout(this.checkConnection, 3000);
      } else {
        this.connectionStatusMessage = 'Connecting...';
      }
    }
  },
  computed: {
    ...mapState({
      transactions: state => state.blockchain.recentTransactions,
      isConnected: state => state.blockchain.streamConnected
    })
  },
  methods: {
    checkConnection() {
      if (!this.isConnected) {
        this.connectionStatusMessage = 'Connecting...<br>It\'s taking longer than usual, please wait or try again later.';
      }
    },
    viewTx (hash) {
      this.$router.push({ name: 'transaction', params: { hash }});
    },
    syncTxList() {
      this.syncedTransactions = this.transactions.slice().reverse().concat(this.initialTransactions);
    },
    moment
  },
};
</script>

<style lang="scss">
</style>