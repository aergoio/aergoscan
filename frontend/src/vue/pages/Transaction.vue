<template>
  <div class="wrap">
    <div class="page-content">
      <div class="island">
        <div class="island-title">
          Transaction Details
          <div v-if="!txDetail">Loading...</div>
          <div v-if="txDetail" class="subtitle monospace">{{txDetail.tx.hash}}</div>
        </div>
        <div class="island-content">
          
          <div v-if="txDetail">
            <div class="transaction-flow-diagram">
              <AccountBox :address="txDetail.tx.from" />
              <span class="flow-arrow"></span>
              <AccountBox :address="txDetail.tx.to" />
            </div>
            
            <table class="detail-table">
              <tr><td>Amount:</td><td v-html="$options.filters.formatToken(txDetail.tx.amount)"></td></tr>
              <tr><td>Nonce:</td><td>{{txDetail.tx.nonce}}</td>
              <tr v-if="txDetail.block">
                <td>Included in block:</td>
                <td class="monospace"><router-link :to="`/block/${txDetail.block.hash}/`">{{txDetail.block.hash}}</router-link></td>
              </tr>
              <tr v-if="txDetail.tx.payload">
                <td>Payload:</td>
                <td class="monospace">{{payloadAsString}}</td>
              </tr>
            </table>
            
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
import AccountBox from '../components/AccountBox';

export default {
  data () {
    return {
      txDetail: null
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
  components: {
    AccountBox,
  },
  computed: {
    payloadAsString() {
      if (!this.txDetail || !this.txDetail.tx.payload) return '';
      return Buffer.from(this.txDetail.tx.payload).toString()
    }
  },
  methods: {
    load() {
      let hash = this.$route.params.hash;
      this.$store.dispatch('blockchain/getTransaction', { hash: hash }).then(tx => {
        this.$data.txDetail = tx;
      });
    },
    moment
  },
};
</script>

<style lang="scss">
.transaction-flow-diagram {
  display: flex;
  flex-direction: column;
  align-items: center;

  .flow-arrow {
    display: inline-block;
    border: 8px solid transparent;
    border-top-color: #333;
    margin-top: 8px;
  }
}

</style>