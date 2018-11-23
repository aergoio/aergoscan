<template>
  <div class="table-like">
    <div class="row header">
      <div class="cell" style="width: 85px">Number</div>
      <div class="cell" style="width: 85px">Time</div>
      <div class="cell">Transactions</div>
      <div class="cell"><span class="icon icon-view" style="visibility: hidden"></span></div>
    </div>
    <transition-group name="animated-list" tag="div" style="height: 400px; overflow: auto;">
      <div class="row" v-if="!isConnected" key="connection-status">
        <div class="cell" v-html="connectionStatusMessage"></div>
      </div>

      <div class="row clickable" v-for="block in reverseBlocks" :key="block.hash" v-on:click="viewBlock(block.hash)" :class="{reorg: block.detectedReorg}">
        <div class="cell" style="width: 85px">
          {{block.header.blockno}}
        </div>
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
      connectionStatusMessage: 'Connecting...'
    }
  },
  created () {
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
  mounted () {
    this.$store.dispatch('blockchain/streamBlocks');
    setTimeout(this.checkConnection, 3000);
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
    checkConnection() {
      if (!this.isConnected) {
        this.connectionStatusMessage = 'Connecting...<br>It\'s taking longer than usual, please wait or try again later.';
      }
    },
    viewBlock (hash) {
      this.$router.push(`/block/${hash}`);
    },
    moment
  },
};
</script>

<style lang="scss">
.reorg {
  &.animated-list-enter {
    background-color: red;
  }

  .cell:first-child:after {
    content: "";
    display: inline-block;
    width: 14px;
    height: 11px;
    background: url(~@assets/img/reorg.svg);
    background-size: auto 11px;
    background-repeat: no-repeat;
    display: inline-block;
    background-position: 50% 50%;
  }
}
</style>