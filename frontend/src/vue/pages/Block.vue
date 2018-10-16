<template>
  <div class="wrap">
    <div class="page-content">
      <div class="island">
        <div class="island-title">
          Block Details
          <div v-if="!blockDetail">Loading...</div>
          <div v-if="blockDetail" class="subtitle">{{blockDetail.hash}}</div>
        </div>
        <div class="island-content">
          
          <div v-if="blockDetail">
            <p>
            Block height:
              <router-link :to="`/block/${blockDetail.header.blockno - 1}/`">Prev</router-link>
              {{blockDetail.header.blockno}}
              <router-link :to="`/block/${blockDetail.header.blockno + 1}/`">Next</router-link>
              <br>
            Previous block: <router-link :to="`/block/${blockDetail.header.prevblockhash}/`">{{blockDetail.header.prevblockhash}}</router-link><br>
            Time stamp: {{moment(blockDetail.header.timestamp/1000000).format('dddd, MMMM Do YYYY, HH:mm:ss.SSS')}}<br>
            </p>
          </div>
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
      blockDetail: null
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
      });
    },
    moment
  },
  components: {
    TransactionList,
  }
};
</script>

<style lang="scss">
</style>