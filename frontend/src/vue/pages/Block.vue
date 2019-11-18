<template>
  <div class="wrap">
    <div class="page-content">
      <Island>
        <IslandHeader title="Block Details" :annotation="blockDetail ? blockDetail.hash : ''" />

        <div v-if="error">{{error}}</div>
        <div v-if="!blockDetail && !error">Loading...</div>

        <table class="detail-table" v-if="blockDetail">
          <tr><td>Block height:</td>
          <td>
            <router-link :to="`/block/${blockDetail.header.blockno - 1}/`" v-if="hasPrevious">&laquo; Prev</router-link>
            <span class="this-block-height">{{blockDetail.header.blockno}}</span>
            <router-link :to="`/block/${blockDetail.header.blockno + 1}/`">Next &raquo;</router-link>
          </td></tr>
          <tr>
            <td>Previous block:</td>
            <td>
              <router-link v-if="blockDetail.header.prevblockhash" :to="`/block/${blockDetail.header.prevblockhash}/`" class="monospace">{{blockDetail.header.prevblockhash}}</router-link>
              <span v-if="!blockDetail.header.prevblockhash">(none)</span>
            </td>
          </tr>
          <tr>
            <td>Time stamp:</td>
            <td>{{moment(blockDetail.header.timestamp/1000000).format('dddd, MMMM Do YYYY, HH:mm:ss')}} ({{moment(blockDetail.header.timestamp/1000000).fromNow()}})</td>
          </tr>
          <tr v-if="blockDetail.header.blockno">
            <td>Produced by:</td>
            <td v-if="bpId"><Identicon :text="bpId" size="18" class="mini-identicon" /> <router-link :to="`/votes/?highlight=${bpId}`">{{bpId}}</router-link></td>
            <td v-if="!bpId">Unknown</td>
          </tr>
          <tr v-if="blockDetail.header.blockno">
            <td>Coinbase account:</td>
            <td v-if="blockDetail.header.coinbaseaccount.toString()"><Identicon :text="blockDetail.header.coinbaseaccount" size="18" class="mini-identicon" /> <router-link :to="`/account/${blockDetail.header.coinbaseaccount}/`">{{blockDetail.header.coinbaseaccount.toString()}}</router-link></td>
            <td v-else>None</td>
          </tr>
          <tr v-if="blockDetail.size">
            <td>Size:</td>
            <td>{{blockDetail.size}} bytes</td>
          </tr>
          <tr>
            <td>Reward:</td>
            <td>
              <span v-if="!blockDetail.header.rewardaccount.isEmpty()">
                <Identicon :text="blockDetail.header.rewardaccount" size="18" class="mini-identicon" /> <router-link :to="`/account/${blockDetail.header.rewardaccount}/`">{{blockDetail.header.rewardaccount.toString()}}</router-link>
                ({{blockDetail.voteReward.toString()}})
              </span>
              <span v-else>
                None
              </span>
            </td>
          </tr>
        </table>
      </Island>
      
      <BlockTxTable :hash="blockDetail.hash" v-if="blockDetail" />
    </div>
  </div>
</template>

<script>
import aergo from '../../controller';
import moment from 'moment';
import { mapState } from 'vuex';
import TransactionList from '../components/TransactionList';
import { timedAsync } from 'timed-async';
import Identicon from '../components/Identicon';
import { sha256 } from 'hash.js';
import bs58 from 'bs58';
import { Island, IslandHeader } from "aergo-ui/src/components/layout";
import BlockTxTable from '../components/BlockTxTable';

function pubkeyToPeerid(pubkey) {
  const decoded = bs58.decode(pubkey);
  if (decoded.length == 0) {
    return "";
  } else if (decoded.length <= 42) {
    return bs58.encode(
      Buffer.concat(
        [
          Buffer.from([0, decoded.length]),
          decoded
        ]
      )
    );
  } else {
    const hash = Buffer.from(sha256().update(decoded).digest());
    return bs58.encode(
      Buffer.concat(
        [
          Buffer.from([0, 27, 8, 2, 0x12, hash.length]),
          hash
        ]
      )
    );
  }
}

export default {
  data () {
    return {
      blockDetail: null,
      error: null
    }
  },
  created () {
  },
  watch: {
    '$route' (to, from) {
      this.load();
    }
  },
  computed: {
    hasPrevious() {
      return this.blockDetail.header.blockno > 0;
    }
  },
  mounted () {
    this.load();
  },
  beforeDestroy () {
  },
  methods: {
    async load() {
      let blockNoOrHash = this.$route.params.blockNoOrHash;
      if (""+parseInt(this.$route.params.blockNoOrHash) === this.$route.params.blockNoOrHash) {
        blockNoOrHash = parseInt(this.$route.params.blockNoOrHash);
      }
      this.blockDetail = null;
      this.error = '';
      try {
        this.blockDetail = await timedAsync(this.$store.dispatch('blockchain/fetchBlockMetadata', { blockNoOrHash: blockNoOrHash }));
        this.bpId = pubkeyToPeerid(this.blockDetail.header.pubkey);
      } catch (error) {
        this.error = ''+error;
        console.error(error);
      };
    },
    moment
  },
  components: {
    TransactionList,
    Identicon,
    Island, IslandHeader,
    BlockTxTable,
  }
};
</script>

<style lang="scss">
.this-block-height {
  font-weight: 500;
}
</style>