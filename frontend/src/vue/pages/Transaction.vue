<template>
  <div class="wrap">
    <div class="page-content">
      <div class="island">
        <div class="island-title">
          Transaction Details
          <div v-if="!txDetail && !error">Loading...</div>
          <div v-if="txDetail" class="subtitle monospace">{{txDetail.tx.hash}}</div>
        </div>
        <div class="island-content">

          <p v-if="error">{{error}}</p>
          
          <div v-if="txDetail">
            <div class="transaction-flow-diagram">
              <AccountBox :address="txDetail.tx.from" />
              <span class="flow-arrow"></span>
              <AccountBox v-if="txDetail.tx.to && txDetail.tx.to.toString().length" :address="txDetail.tx.to" />
              <div class="account-box null-address" v-if="!txDetail.tx.to || !txDetail.tx.to.toString().length">Contract Creation</div>
            </div>
            
            <table class="detail-table">
              <tr><td>Amount:</td><td v-html="$options.filters.formatToken(txDetail.tx.amount, 'aergo')"></td></tr>
              <tr><td>Fee:</td><td v-html="$options.filters.formatToken(txFee, 'gaer')"></td></tr>
              <tr><td>Nonce:</td><td>{{txDetail.tx.nonce}}</td></tr>
              <tr v-if="txDetail.block">
                <td>Included in block:</td>
                <td class="monospace"><router-link :to="`/block/${txDetail.block.hash}/`">{{txDetail.block.hash}}</router-link></td>
              </tr>
              <tr v-if="txDetail.tx.payload">
                <td>Payload:</td>
                <td><PayloadFormatter :payload="txDetail.tx.payload" :txType="txDetail.tx.type" :recipient="txDetail.tx.to" /></td>
              </tr>
            </table>
            
          </div>
        </div>

        <div class="island-title" v-if="txReceipt">Receipt</div>
        <div class="island-content" v-if="txReceipt">
          
          <div class="transaction-flow-diagram">
            <AccountBox v-if="txReceipt.contractaddress" :address="txReceipt.contractaddress" />
          </div>

          <table class="detail-table">
            <tr><td>Status:</td><td class="monospace">{{txReceipt.status}}</td></tr>
            <tr><td>Result:</td><td class="monospace">{{txReceipt.result}}</td></tr>
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
import PayloadFormatter from '../components/PayloadFormatter';
import cfg from '../../config';

export default {
  data () {
    return {
      txDetail: null,
      txReceipt: null,
      error: null,
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
    PayloadFormatter,
  },
  computed: {
    txFee() {
      return (this.txDetail.tx.type === 1 ? 0 : cfg.CHAIN.coinbasefee);
    }
  },
  methods: {
    async load() {
      this.error = null;
      let hash = this.$route.params.hash;
      try {
        this.txDetail = await this.$store.dispatch('blockchain/getTransaction', { hash });
      } catch (e) {
        this.error = '' + e;
        return;
      }
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