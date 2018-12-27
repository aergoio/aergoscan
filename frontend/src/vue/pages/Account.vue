<template>
  <div class="wrap">
    <div class="page-content">
      <div class="island">
        <div class="island-title">
          Account Details
        </div>
        <div class="island-content">
          <div class="transaction-flow-diagram">
            <AccountBox v-if="accountDetail" :address="realAddress" :label="$route.params.address" />
          </div>
          
          <div v-if="error">Error: {{error}}</div>

          <div v-if="!accountDetail && !error">Loading...</div>

          <div v-if="accountDetail">

            <table class="detail-table">
              <tr v-if="ownerAddress">
                <td>Alias for:</td>
                <td>{{ownerAddress}}</td>
              </tr>

              <tr><td>Balance:</td><td>
                <span v-html="$options.filters.formatToken(accountDetail.balance, 'aergo')"></span>
                ({{accountDetail.balance.toString()}})  
              </td></tr>
              
              <tr v-if="staking">
                <td>Staked amount:</td>
                <td>
                  <span v-html="$options.filters.formatToken(staking.amount, 'aergo')"></span>
                  <span v-if="staking.when">
                    (since <router-link :to="`/block/${staking.when}/`">{{staking.when}}</router-link>)
                  </span>
                </td>
              </tr>
              
              <tr><td>Nonce:</td><td>{{accountDetail.nonce}}</td></tr>
            </table>

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
import { Address } from '@herajs/client';

export default {
  data () {
    return {
      contractAbi: null,
      transactions: [],
      error: null,
      accountDetail: null,
      staking: null,
      ownerAddress: null
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
    realAddress() {
      return this.ownerAddress || this.$route.params.address;
    }
  },
  methods: {
    async load() {
      let address;
      this.error = null;
      this.ownerAddress = null;
      this.staking = null;
      this.accountDetail = null;
      this.contractAbi = null;
      this.transactions = [];

      // Check address
      try {
        address = new Address(this.$route.params.address);
      } catch (e) {
        this.error = 'Invalid address';
        console.error(e);
        return;
      }
      
      // Owner
      try {
        if (address.isName) {
          const nameInfo = await this.$store.dispatch('blockchain/getNameInfo', { name: address.encoded });
          this.ownerAddress = nameInfo.owner.toString();
          address = this.ownerAddress;
        }
      } catch (e) {
        this.error = 'Unregistered name';
        console.error(e);
        return;
      }

      // State
      try {
        this.accountDetail = Object.freeze(await this.$store.dispatch('blockchain/getAccount', { address }));
      } catch (e) {
        this.error = 'Account not found';
        console.error(e);
        return;
      }

      // Staking info
      try {
        this.staking = Object.freeze(await this.$store.dispatch('blockchain/getStaking', { address }));
      } catch (e) {
        console.error(e);
      }

      // Contract
      try {
        if (this.accountDetail.codehash) {
          this.contractAbi = await this.$store.dispatch('blockchain/getABI', { address });
        }
        const response = await this.$fetch.get(`${cfg.API_URL}/accountTransactions`, { address });
        this.transactions = (await response.json()).map(tx => ({...tx, ...tx.meta}));
      } catch (e) {
        console.error(e);
      }
    },
    moment
  },
};
</script>

<style lang="scss">
</style>