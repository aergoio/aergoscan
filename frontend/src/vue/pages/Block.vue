<template>
  <div class="wrap">
    <div class="page-content">
      <div class="island">
        <div class="island-title">
          <div v-if="!blockDetail">Loading...</div>
          <div v-if="blockDetail">Block {{blockDetail.hash}}</div>
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
            Transactions: {{blockDetail.body}}
            </p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import aergo from '../../controller';
import moment from 'moment';
import { mapState } from 'vuex'

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
      this.$store.dispatch('blockchain/getBlock', { blockNoOrHash: blockNoOrHash }).then(block => {
        this.$data.blockDetail = block;
      });
    },
    moment
  },
};
</script>

<style lang="scss">
</style>