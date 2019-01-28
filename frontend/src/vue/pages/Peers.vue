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

          <table class="data-table peer-table">
            <thead>
              <tr>
                <th v-on:click="sortBy('address.peerid')" class="sortable" :class="{sorted: sorting === 'address.peerid', sortingAsc}">Peer ID</th>
                <th v-on:click="sortBy('state')" class="sortable" :class="{sorted: sorting === 'state', sortingAsc}">State</th>
                <th v-on:click="sortBy('bestblock.blockno')" class="sortable" :class="{sorted: sorting === 'bestblock.blockno', sortingAsc}">Height</th>
                <th>Block hash</th>
                <th>Block time</th>
              </tr>
            </thead>
            <tr v-for="peer in peersSorted" :key="peer.address.peerid">
              <td class="monospace">
                <span v-if="peerVotes.indexOf(peer.address.peerid) === -1">{{peer.address.peerid}}</span>
                <router-link :to="`/votes/?highlight=${peer.address.peerid}`" v-if="peerVotes.indexOf(peer.address.peerid) !== -1">{{peer.address.peerid}}</router-link>
              </td>
              <td>
                {{peer.state}}
              </td>
              <td>
                {{peer.bestblock.blockno}}
              </td>
              <td class="monospace">
                <router-link :to="`/block/${peer.bestblock.blockhash}/`">{{peer.bestblock.blockhash}}</router-link>
              </td>
              <td>
                <span v-if="peer.bestblock.time">
                {{moment(peer.bestblock.time/1000000).format('MMM Do YYYY, HH:mm:ss')}}
                </span>
                <span v-if="!peer.bestblock.time">
                  ???
                </span>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ReloadButton from '../components/ReloadButton';
import moment from 'moment';

function getKey(obj, keyPath) {
  const parts = keyPath.split('.');
  let result = obj;
  let part;
  while (part = parts.shift()) {
    result = result[part];
  }
  return result;
}

export default {
  data () {
    return {
      peers: null,
      peerVotes: [],
      error: null,
      sorting: 'address.peerid',
      sortingAsc: false,
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
  computed: {
    peersSorted() {
      if (this.peers === null) return [];
      let peers = [...this.peers];
      peers.sort((a, b) => {
        const A = getKey(a, this.sorting);
        const B = getKey(b, this.sorting);
        if (typeof A === 'string')
          return A.localeCompare(B);
        else
          return A - B;
      });
      if (!this.sortingAsc) {
        peers.reverse();
      }
      return peers;
    },
  },
  beforeDestroy () {
  },
  methods: {
    async load() {
      try {
        (async () => {
          try {
            const votesList = await this.$store.dispatch('blockchain/getTopVotes', { count: 50 });
            this.peerVotes = votesList.map(vote => vote.candidate);
            console.log(this.peerVotes);
          } catch (e) {
            console.error(e);
          }
        })();

        const peers = await this.$store.dispatch('blockchain/fetchPeers');

        for (let peer of peers) {
          this.peerVotes[peer.address.peerid] = {};
          if (!peer.bestblock) continue;
          peer.bestblock.time = 0;
          try {
            this.$store.dispatch('blockchain/getBlock', {blockNoOrHash: peer.bestblock.blockhash}).then(block => {
              peer.bestblock.time = block.header.timestamp;
            });
          } catch(e) {
            console.error(e);
          }
        }
        this.peers = peers;
      } catch (e) {
        this.error = '' + e;
        console.error(e);
      }
    },
    sortBy(key) {
      if (this.sorting === key) {
        this.sortingAsc = !this.sortingAsc;
      } else {
        this.sorting = key;
      }
    },
    moment,
  },
  components: {
    ReloadButton,
  },
};
</script>

<style lang="scss">
.peer-table .monospace {
  font-size: 85%;
}
</style>