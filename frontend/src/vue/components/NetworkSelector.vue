<template>
  <span class="network-selector" v-on:click="promptNetwork">
    <span class="network-icon" v-bind:style="styleObject"></span>
    {{networkDisplay}}
    <span v-if="isConnected">
    (<router-link :to="`/block/${bestBlock.header.blockno}/`">#{{bestBlock.header.blockno}}</router-link>)
    </span>
  </span>
</template>

<script>
import aergo from '../../controller';
import { GrpcWebProvider } from '@herajs/client';
import { mapState, mapActions } from 'vuex'

export default {
  data () {
    return {
      blockHeight: 0,
      network: 'testnet'
    }
  },
  created () {

  },
  beforeDestroy () {
  },
  computed: {
    ...mapState({
      blocks: state => state.blockchain.recentBlocks,
      isConnected: state => state.blockchain.streamConnected
    }),
    bestBlock() {
      return this.blocks[this.blocks.length - 1];
    },
    networkDisplay () {
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
    promptNetwork() {
      return; // disabled until proper UI is built
      const input = prompt('Enter network address (e.g. 127.0.0.1:7845)');
      if (!input) return;
      this.network = input;
      const url = 'http://' + this.network;
      const provider = new GrpcWebProvider({url: url});
      console.log('Setting provider to', url);
      this.$store.dispatch('blockchain/setProvider', { provider });
      this.$data.isConnected = false;
      this.updateStatus();
    },
  },
  components: {
  }
};
</script>

<style lang="scss">
.network-selector {
  text-transform: uppercase;
  font-weight: 500;
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