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

          <table class="peer-table">
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
                {{peer.address.peerid}}
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
        const peers = await this.$store.dispatch('blockchain/fetchPeers');
        for (let peer of peers) {
          peer.bestblock.time = 0;
          if (!peer.bestblock) continue;
          try {
            this.$store.dispatch('blockchain/getBlock', {blockNoOrHash: peer.bestblock.blockhash}).then(block => {
              peer.bestblock.time = block.header.timestamp;
            });
          } catch(e) {

          }
        }
        this.peers = peers;
      } catch (e) {
        this.error = '' + e;
      }
    },
    sortBy(key) {
      if (this.sorting === key) {
        this.sortingAsc = !this.sortingAsc;
      } else {
        this.sorting = key;
      }
      console.log('sorting by', this.sorting, this.sortingAsc);
    },
    moment,
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
.peer-table {
  width: 100%;
  border-collapse: collapse;

  .monospace {
    font-size: 85%;
  }

  thead {
    th {
      text-align: left;
      font-weight: 500;
      white-space: nowrap;

      &.sortable {
        cursor: pointer;
        user-select: none;

        &.sorted:after {
          content: " ⊤";
        }
        &.sorted.sortingAsc:after {
          content: " ⊥";
        }
      }
    }
  }
  td, th {
    border-bottom: 1px solid #ddd;
    padding: .75em;
  }
}
</style>