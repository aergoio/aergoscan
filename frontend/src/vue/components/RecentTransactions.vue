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
        <div class="cell">Connecting...</div>
      </div>
      <div class="row clickable" v-for="tx in reverseTransactions" :key="tx.hash" v-on:click="viewTx(tx.hash)">
        <div class="cell" style="width: 75px">{{moment(tx.block.header.timestamp/1000000).format('HH:mm:ss')}}</div>
        <div class="cell" style="width: 75px">{{tx.block.header.blockno}}</div>
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

export default {
  data () {
    return {
    }
  },
  created () {
  },
  mounted () {
    this.$store.dispatch('blockchain/streamBlocks');
  },
  beforeDestroy () {
  },
  computed: {
    ...mapState({
      transactions: state => state.blockchain.recentTransactions,
      isConnected: state => state.blockchain.streamConnected
    }),
    reverseTransactions() {
      return this.transactions.slice().reverse();
    }
  },
  methods: {
    viewTx (hash) {
      this.$router.push({ name: 'transaction', params: { hash }});
    },
    moment
  },
};
</script>

<style lang="scss">
</style>