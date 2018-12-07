<template>
  <div class="wrap">
    <div class="page-content">
      <div class="island">
        <div class="island-title">
          Account Details
        </div>
        <div class="island-content">
          <AccountBox v-if="accountDetail" :address="$route.params.address" />
          
          <div v-if="error">Error: {{error}}</div>

          <div v-if="!accountDetail && !error">Loading...</div>

          <div v-if="accountDetail">
            <p>
              Balance: <span v-html="$options.filters.formatToken(accountDetail.balance.toString())"></span> ({{accountDetail.balance.toString()}} aer)
            </p>
          </div>
        </div>

        <div class="island-title" v-if="this.accountDetail && this.accountDetail.codehash">Contract</div>
        <div class="island-content" v-if="this.accountDetail && this.accountDetail.codehash">
          <ContractAbi :abi="contractAbi" :codehash="this.accountDetail.codehash" :address="$route.params.address" />
        </div>

        <div class="island-title" v-if="transactions.length">
          {{transactions.length == 50 ? "Last 50" : transactions.length}} Transactions
        </div>
        <TransactionList :items="transactions" class="island-content" showTimes="true" :baseAccount="$route.params.address" v-if="transactions.length" />
      </div>

    </div>
  </div>
</template>

<script>
import aergo from '../../controller';
import moment from 'moment';
import AccountBox from '../components/AccountBox';
import ContractAbi from '../components/ContractAbi';
import TransactionList from '../components/TransactionList';
import cfg from '../../config.js';

export default {
  data () {
    return {
      contractAbi: null,
      transactions: [],
      error: null,
      accountDetail: null
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
    ContractAbi,
    TransactionList,
  },
  computed: {
  },
  methods: {
    async load() {
      let address = this.$route.params.address;
      this.error = null;
      try {
        this.accountDetail = Object.freeze(await this.$store.dispatch('blockchain/getAccount', { address }));
      } catch (e) {
        this.error = 'Account not found';
        console.error(e);
        return;
      }
      try {
        if (this.accountDetail.codehash) {
          this.contractAbi = await this.$store.dispatch('blockchain/getABI', { address });
        }
        const response = await this.$fetch.get(`${cfg.API_URL}/stats/accountTransactions`, { address });
        this.transactions = (await response.json()).map(tx => ({...tx, ...tx.meta}));
      } catch (e) {
        console.log(e);
      }
    },
    moment
  },
};
</script>

<style lang="scss">
</style>