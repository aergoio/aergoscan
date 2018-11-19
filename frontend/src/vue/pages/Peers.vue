<template>
  <div class="wrap">
    <div class="page-content">
      <div class="island">
        <div class="island-title">
          Peers
        </div>
        <div class="island-content">
          
          <ul>
            <li v-for="peer in peers" :key="peer.peerid">
              {{peer.address.peerid}}: State {{peer.state}}, Best block: #{{peer.bestblock.blockno}} {{peer.bestblock.blockhash}}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      peers: null
    }
  },
  created () {
  },
  watch: {
    '$route' (to, from) {
      this.load();
    }
  },
  mounted () {
    this.load();
  },
  beforeDestroy () {
  },
  methods: {
    async load() {
      const result = await this.$store.dispatch('blockchain/fetchPeers');
      this.peers = result.peersList;
    }
  },
  components: {
  },
};
</script>

<style lang="scss">
</style>