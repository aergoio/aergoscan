<template>
  <div class="table-like">
    <div class="row header">
      <div class="cell">Number</div>
      <div class="cell" style="width: 80px">Time</div>
      <div class="cell"><span class="tooltipped-n" v-tooltip="'Block producer pubkey'">BP</span></div>
      <div class="cell"><span class="tooltipped-n" v-tooltip="'Number of transactions'">TXs</span></div>
      <div class="cell"><span class="icon icon-view" style="visibility: hidden; margin-right: 16px;"></span></div>
    </div>
    <transition-group name="animated-list" tag="div" class="scroll-list" style="height: 400px;">
      <div class="row" v-if="!isConnected" key="connection-status">
        <div class="cell" v-html="connectionStatusMessage"></div>
      </div>

      <div class="row clickable" v-for="block in reverseBlocks" :key="block.hash" v-on:click="viewBlock(block.hash)" :class="{reorg: block.detectedReorg}">
        <div class="cell" style="width: 85px">
          {{block.header.blockno}}
        </div>
        <div class="cell" style="width: 80px">{{moment(block.header.timestamp/1000000).format('HH:mm:ss')}}</div>
        <div class="cell"><Identicon :text="block.header.pubkey" size="16" class="tiny-identicon tooltipped-s" v-tooltip="block.header.pubkey" /></div>
        <div class="cell">{{block.txcount}} tx</div>
        <div class="cell"><span class="icon icon-view"></span></div>
      </div>
    </transition-group>
  </div>
</template>

<script>
import moment from 'moment';
import { mapState, mapActions } from 'vuex'
import Identicon from '../components/Identicon';

const CONNECTING_MSG = 'Connecting...';
const CONNECTING_SLOW_MSG = 'Connecting...<br>It\'s taking longer than usual, please wait or try again later.';


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
      isConnected: state => state.blockchain.streamConnected,
      connectionStatusMessage: state => state.blockchain.streamState === 'starting-slow' ? CONNECTING_SLOW_MSG : CONNECTING_MSG,
    }),
    reverseBlocks() {
      return this.blocks.slice().reverse();
    }
  },
  components: {
    Identicon,
  },
  methods: {
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