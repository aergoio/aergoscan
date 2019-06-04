<template>
  <div class="wrap">
    <div class="page-content">
      <Island>
        <IslandHeader title="Peers">
          <div style="align-self: center;">
            <ReloadButton :action="load" />
          </div>
        </IslandHeader>
        <div v-if="error" class="error">{{error}}</div>

        <table class="data-table peer-table">
          <thead>
            <tr>
              <th v-on:click="sortBy('address.peerid')" class="sortable" :class="{sorted: sorting === 'address.peerid', sortingAsc}">Peer ID</th>
              <th v-on:click="sortBy('version')" class="sortable" :class="{sorted: sorting === 'version', sortingAsc}">Version</th>
              <th v-on:click="sortBy('bestblock.blockno')" class="sortable" :class="{sorted: sorting === 'bestblock.blockno', sortingAsc}">Height</th>
              <th>Block hash</th>
              <th>Block time</th>
            </tr>
          </thead>
          <tr v-for="peer in peersSorted" :key="peer.address.peerid">
            <td class="monospace">
              <span v-if="bpsList.indexOf(peer.address.peerid) === -1">{{peer.address.peerid}}</span>
              <router-link :to="`/consensus/?highlight=${peer.address.peerid}`" v-if="bpsList.indexOf(peer.address.peerid) !== -1">{{peer.address.peerid}}</router-link>
              <span v-if="bpsList.indexOf(peer.address.peerid) !== -1" class="label">BP</span>
              <span v-if="raftLeaderID === peer.address.peerid" class="label">Leader</span>
              <span v-if="peer.address.peerid === selfPeerId" class="label">self</span>
            </td>
            <td>{{peer.version}}</td>
            <td>{{peer.bestblock.blockno}}</td>
            <td class="monospace">
              <router-link :to="`/block/${peer.bestblock.blockhash}/`">{{peer.bestblock.blockhash}}</router-link>
            </td>
            <td>
              <span v-if="peer.bestblock.time">
              {{moment(peer.bestblock.time/1000000).format('MMM Do YYYY, HH:mm:ss')}}
              </span>
              <span v-if="!peer.bestblock.time">
                not synced
              </span>
            </td>
          </tr>
        </table>
        <p class="note" v-if="loadTime">Data retrieved from {{selfPeerId}} at {{loadTime.format('HH:mm:ss')}}.</p>
      </Island>

      <Island v-if="serverInfoItems">
        <IslandHeader title="Server Info" />
        <table class="kv-table">
          <tr v-for="[key, value] in serverInfoItems" :key="key">
            <th>{{key}}</th>
            <td>{{value}}</td>
          </tr>
        </table>
      </Island>
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

// cache getBlock request Promises to not request the same block multiple times
const requests = {};
function requestBlock($store, hash) {
  if (!requests.hasOwnProperty(hash)) {
    requests[hash] = $store.dispatch('blockchain/getBlock', {blockNoOrHash: hash});
  }
  return requests[hash];
}

export default {
  data () {
    return {
      peers: null,
      consensusInfo: null,
      error: null,
      sorting: 'address.peerid',
      sortingAsc: false,
      serverInfo: null,
      loadTime: null
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
    serverInfoItems() {
      const items = new Map();
      if (this.serverInfo === null) return items;
      items.set('peerid', this.serverInfo.statusMap.get('id'));
      items.set('version', this.serverInfo.statusMap.get('version'));
      return Array.from(items);
    },
    selfPeerId() {
      if (!this.peers || this.peers.length === 0) return '';
      const [selfPeer] = this.peers.filter(peer => peer.selfpeer);
      return selfPeer.address.peerid;
    },
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
    bpsList() {
      return this.consensusInfo && this.consensusInfo.bpsList ? this.consensusInfo.bpsList.map(item => item.PeerID) : [];
    },
    raftLeaderID() {
      if (!this.consensusInfo.info || !this.consensusInfo.info.Leader) return '';
      try {
        const peer = this.consensusInfo.bpsList.find(item => item.Name === this.consensusInfo.info.Leader);
        return peer.PeerID;
      } catch(e) {
        console.log(e);
        return '';
      }
    }
  },
  beforeDestroy () {
  },
  methods: {
    async loadConsensusInfo() {
      this.consensusInfo = Object.freeze(await this.$store.dispatch('blockchain/getConsensusInfo'));
      console.log(this.consensusInfo);
    },
    async loadServerInfo() {
      try {
        const result = await this.$store.dispatch('blockchain/getServerInfo');
        console.log(result);
        this.serverInfo = result;
      } catch (e) {
        console.error(e);
      }
    },
    async load() {
      try {
        this.loadServerInfo();
        
        await this.loadConsensusInfo();

        const peers = await this.$store.dispatch('blockchain/fetchPeers');
        for (let peer of peers) {
          if (!peer.bestblock) continue;
          peer.bestblock.time = 0;
          try {
            requestBlock(this.$store, peer.bestblock.blockhash).then(block => {
              peer.bestblock.time = block.header.timestamp;
            });
          } catch(e) {
            console.error(e);
          }
        }
        this.peers = peers;
        this.loadTime = moment();
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
.peer-table {
  margin-bottom: 1em;
}
.note {
  color: #666;
  font-size: .95em;
}
.peer-table .monospace {
  font-size: 85%;
}
</style>