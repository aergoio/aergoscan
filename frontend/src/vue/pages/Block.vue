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
              <router-link :to="`/block/${blockDetail.header.blockno - 1}/`">&laquo; Prev</router-link>
              <span class="this-block-height">{{blockDetail.header.blockno}}</span>
              <router-link :to="`/block/${blockDetail.header.blockno + 1}/`">Next &raquo;</router-link>
            </td></tr>
            <tr><td>Previous block:</td><td><router-link :to="`/block/${blockDetail.header.prevblockhash}/`" class="monospace">{{blockDetail.header.prevblockhash}}</router-link></td></tr>
            <tr><td>Time stamp:</td><td>{{moment(blockDetail.header.timestamp/1000000).format('dddd, MMMM Do YYYY, HH:mm:ss.SSS')}}</td></tr>
          </table>
        </div>

        <div class="island-title" v-if="blockDetail">
          {{blockDetail.body.txsList.length}} Transactions
        </div>
        <TransactionList :items="blockDetail.body.txsList" class="island-content" v-if="blockDetail" />
      </div>

    </div>
  </div>
</template>

<script>
import aergo from '../../controller';
import moment from 'moment';
import { mapState } from 'vuex';
import TransactionList from '../components/TransactionList';
import { loadAndWait } from '../utils/async';

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
  mounted () {
    this.load();
  },
  beforeDestroy () {
  },
  methods: {
    load() {
      let blockNoOrHash = this.$route.params.blockNoOrHash;
      if (""+parseInt(this.$route.params.blockNoOrHash) === this.$route.params.blockNoOrHash) {
        blockNoOrHash = parseInt(this.$route.params.blockNoOrHash);
      }
      this.$data.blockDetail = null;
      const waitMinimum = loadAndWait();
      this.$store.dispatch('blockchain/getBlock', { blockNoOrHash: blockNoOrHash }).then(async (block) => {
        await waitMinimum();
        this.$data.blockDetail = block;
      })/*.catch(error => {
        this.error = ''+error;
      });*/
    },
    moment
  },
  components: {
    TransactionList,
  }
};
</script>

<style lang="scss">
.this-block-height {
  font-weight: 500;
}
</style>