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
              <AccountBox v-if="txDetail.tx.to" :address="txDetail.tx.to" />
              <div class="account-box null-address" v-if="!txDetail.tx.to">Contract Creation</div>
            </div>
            
            <table class="detail-table">
              <tr><td>Amount:</td><td v-html="$options.filters.formatToken(txDetail.tx.amount)"></td></tr>
              <tr><td>Fee:</td><td v-html="$options.filters.formatToken(1, 'aer')"></td></tr>
              <tr><td>Nonce:</td><td>{{txDetail.tx.nonce}}</td></tr>
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

        <div class="island-title" v-if="txReceipt">Receipt</div>
        <div class="island-content" v-if="txReceipt">
          
          <table class="detail-table">
            <tr><td>Contract:</td><td><AccountBox :address="txReceipt.contractaddress" /></td></tr>
            <tr><td>Result:</td><td class="monospace">{{txReceipt.result}}</td></tr>
            <tr><td>Status:</td><td class="monospace">{{txReceipt.status}}</td></tr>
          </table>
           
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
      txDetail: null,
      txReceipt: null
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
    async load() {
      let hash = this.$route.params.hash;
      this.txDetail = await this.$store.dispatch('blockchain/getTransaction', { hash });
      this.txReceipt = await this.$store.dispatch('blockchain/getTransactionReceipt', { hash });
      
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