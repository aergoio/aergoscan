<template>
  <div class="table-like">
    <div class="row header">
      <div class="cell" style="width: 85px">Number</div>
      <div class="cell" style="width: 85px">Time</div>
      <div class="cell">Transactions</div>
      <div class="cell"></div>
    </div>
    <transition-group name="animated-list" tag="div" style="height: 400px; overflow: auto;">
      <div class="row" v-if="!isConnected" key="connection-status">
        <div class="cell">Connecting...</div>
      </div>
      <div class="row clickable" v-for="block in reverseBlocks" :key="block.hash" v-on:click="viewBlock(block.header.blockno)">
        <div class="cell" style="width: 85px">{{block.header.blockno}}</div>
        <div class="cell" style="width: 85px">{{moment(block.header.timestamp/1000000).format('HH:mm:ss')}}</div>
        <div class="cell">{{block.body.txsList.length}} tx</div>
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
      blocks: state => state.blockchain.recentBlocks,
      isConnected: state => state.blockchain.streamConnected
    }),
    reverseBlocks() {
      return this.blocks.slice().reverse();
    }
  },
  methods: {
    viewBlock (blockNo) {
      this.$router.push(`/block/${blockNo}`);
    },
    moment
  },
};
</script>

<style lang="scss">
</style>