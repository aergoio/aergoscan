<template>
  <span class="network-selector" :title="blockHeight" v-on:click="promptNetwork">
    <span class="network-icon" v-bind:style="styleObject"></span>
    {{networkDisplay}}
    (#{{blockHeight}})
  </span>
</template>

<script>
import { promisifySimple } from '../../utils/promisify';
import aergo from '../../controller';
import { GrpcWebProvider } from '@herajs/client';

export default {
  data () {
    return {
      isConnected: false,
      blockHeight: 0,
      network: 'pretestnet'
    }
  },
  created () {
    this.updateStatus();
  },
  beforeDestroy () {
  },
  computed: {
    networkDisplay () {
      return this.network.split(':').join(' ')
    },
    styleObject () {
      const color = '#F91263';
      if (this.$data.isConnected) {
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
    updateStatus () {
      aergo.blockchain().then(status => {
        this.$data.isConnected = true;
        this.$data.blockHeight = status.bestHeight;

        setTimeout(() => {
          this.updateStatus();
        }, 5000);
      }).catch(error => {
        this.$data.isConnected = false;
        console.error('Could not connect to blockchain.', error);

        setTimeout(() => {
          this.updateStatus();
        }, 30000); // Retry after 30s
      });
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