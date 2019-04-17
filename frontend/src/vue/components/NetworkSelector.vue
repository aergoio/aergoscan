<template>
  <span class="network-selector" v-on:click="toggleExpanded" :class="{expanded}">
    <span class="network-icon" v-bind:style="styleObject"></span>
    {{networkDisplay}}
    <span v-if="isConnected">
    (<router-link :to="`/block/${bestBlock.header.blockno}/`">#{{bestBlock.header.blockno}}</router-link>)
    </span>

    <ul class="selector">
      <li v-for="option in options" :key="option.chainid" :class="{active: option.chainid == currentChainId}" v-on:click="goto(option.url, option.chainid == currentChainId)">{{option.label}}</li>
    </ul>
  </span>
</template>

<script>
import aergo from '../../controller';
import { GrpcWebProvider } from '@herajs/client';
import { mapState, mapActions } from 'vuex'

const NETWORKS = {
  'aergo.io': {
    url: 'https://mainnet.aergoscan.io',
    label: 'Mainnet'
  },
  'testnet.aergo.io': {
    url: 'https://testnet.aergoscan.io',
    label: 'Testnet'
  },
  'sqltestnet.aergo.io': {
    url: 'https://sqltestnet.aergoscan.io',
    label: 'SQL Testnet'
  }
}

export default {
  data () {
    return {
      blockHeight: 0,
      network: '',
      expanded: false,
    }
  },
  created () {

  },
  beforeDestroy () {
  },
  computed: {
    ...mapState({
      blocks: state => state.blockchain.recentBlocks,
      isConnected: state => state.blockchain.streamConnected,
      chainInfo: state => state.blockchain.chainInfo
    }),
    currentChainId() {
      try {
        return this.chainInfo.chainid.magic;
      } catch (e) {}
      return 'unknown';
    },
    options() {
      let options = [];
      let hasCurrent = false;
      const current = this.currentChainId;
      for (let chainid in NETWORKS) {
        options.push({chainid, url: NETWORKS[chainid].url, label: NETWORKS[chainid].label});
        if (chainid === current) hasCurrent = true;
      }
      if (!hasCurrent) {
        options.push({chainid: current, url: '', label: current});
      }
      return options;
    },
    bestBlock() {
      return this.blocks[this.blocks.length - 1];
    },
    networkDisplay () {
      try {
        return this.chainInfo.chainid.magic;
      } catch (e) {}
      return this.network.split(':').join(' ')
    },
    styleObject () {
      const color = '#F91263';
      if (this.isConnected || true) {
        return {
          backgroundColor: color,
          borderColor: color
        }
      } else {
        return {
          borderColor: color
        }
      }
      
    }
  },
  methods: {
    toggleExpanded() {
      this.expanded = !this.expanded;
    },
    goto(url, current) {
      if (current) return;
      window.location.href = url;
    }
  },
  components: {
  }
};
</script>

<style lang="scss">
.network-selector {
  text-transform: uppercase;
  font-weight: 500;

  position: relative;
  cursor: pointer;

  .selector {
    position: absolute;
    z-index: 98;
    left: 0;
    bottom: -10px;
    background-color: #ddd;
    transition: all .15s;
    opacity: 0;
    transform: translateY(100%);
    min-width: 100%;
    border-radius: 3px 3px 0 0;
    list-style: none;
    margin: 0;
    padding: 0;

    li {
      line-height: 35px;
      padding: 0 8px;
      white-space: nowrap;

      &:not(:first-child) {
        border-top: 1px solid #e6e6e6;
      }

      &:hover {
        cursor: pointer;
        background-color: rgba(255,255,255, 0.2);
      }
      &.active {
        text-decoration: underline;
      }
    }
  }
  &.expanded .selector {
    transform: translateY(0%);
    opacity: 1;
  }
}
.network-icon {
  display: inline-block;
  vertical-align: baseline;
  width: 4px;
  height: 4px;
  margin-right: 2px;
  border: 1px solid transparent;
  border-radius: 100%;
  background-color: #eee;
  position: relative;
  bottom: 1px;
}
</style>