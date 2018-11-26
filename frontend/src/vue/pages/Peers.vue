<template>
  <div class="wrap">
    <div class="page-content">
      <div class="island">
        <div class="island-title">
          Peers
          <ReloadButton :action="load" style="float: right" />
        </div>
        <div class="island-content">
          <div v-if="error" class="error">{{error}}</div>

          <ul class="peer-list">
            <li v-for="peer in peers" :key="peer.address.peerid">
              {{peer.address.peerid}}<br>
              State: {{peer.state}}
              <div class="best-block" v-if="peer.bestblock">
                Block height: {{peer.bestblock.blockno}}<br>
                <span class="monospace"><router-link :to="`/block/${peer.bestblock.blockhash}/`">{{peer.bestblock.blockhash}}</router-link></span>
              </div>
              <div class="best-block" v-if="!peer.bestblock">
                Block height unknown
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ReloadButton from '../components/ReloadButton';

export default {
  data () {
    return {
      peers: null,
      error: null,
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
      try {
        this.peers = await this.$store.dispatch('blockchain/fetchPeers');
        this.peers.sort((a, b) => a.address.peerid.localeCompare(b.address.peerid));
      } catch (e) {
        this.error = '' + e;
      }
    }
  },
  components: {
    ReloadButton,
  },
};
</script>

<style lang="scss">
.peer-list {
  list-style: none;
  margin: 0;
  padding: 0;
  
  li {
    width: 250px;
    display: inline-block;
    text-align: center;
    vertical-align: top;
    border: 1px solid #ccc;
    margin: 0 15px 15px 0;
    padding: 10px;
    word-break: break-all;

    .best-block {
      border-top: 1px solid #efefef;
      padding-top: 6px;
      margin-top: 6px;
    }
  }
}
</style>