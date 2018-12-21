<template>
  <div class="wrap">
    <div class="page-content">
      <div class="island">
        <div class="island-title">
          Block Details
          <div v-if="error">{{error}}</div>
          <div v-if="!blockDetail && !error">Loading...</div>
          <div v-if="blockDetail" class="subtitle monospace">{{blockDetail.hash}}</div>
        </div>
        <div class="island-content">
          
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
              <td>{{moment(blockDetail.header.timestamp/1000000).format('dddd, MMMM Do YYYY, HH:mm:ss.SSS')}} ({{moment(blockDetail.header.timestamp/1000000).fromNow()}})</td>
            </tr>
            <tr>
              <td>Produced by:</td>
              <td v-if="blockDetail.header.pubkey"><Identicon :text="blockDetail.header.pubkey" size="18" class="mini-identicon" /> {{blockDetail.header.pubkey}}</td>
              <td v-if="!blockDetail.header.pubkey">Unknown</td>
            </tr>
            <tr>
              <td>Coinbase account:</td>
              <td v-if="blockDetail.header.coinbaseaccount.toString()"><Identicon :text="blockDetail.header.coinbaseaccount" size="18" class="mini-identicon" /> <router-link :to="`/account/${blockDetail.header.coinbaseaccount}/`">{{blockDetail.header.coinbaseaccount.toString()}}</router-link></td>
              <td v-if="!blockDetail.header.coinbaseaccount.toString()">None</td>
            </tr>
          </table>
        </div>

        <div class="island-title" v-if="blockDetail">
          {{blockDetail.body.txsList.length}} Transactions
        </div>
        <TransactionList :items="blockDetail.body.txsList" class="island-content" v-if="blockDetail && blockDetail.body.txsList.length" />
      </div>

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
        const blockDetail = await timedAsync(async () => await this.$store.dispatch('blockchain/getBlock', { blockNoOrHash: blockNoOrHash }));
        for (let tx of blockDetail.body.txsList) {
          tx.amount = Object.freeze(tx.amount); // prevent Vue from adding observer to Amount
        }
        this.blockDetail = blockDetail;
        console.log(blockDetail);
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
  }
};
</script>

<style lang="scss">
.this-block-height {
  font-weight: 500;
}
</style>