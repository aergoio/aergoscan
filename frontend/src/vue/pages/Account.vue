<template>
  <div class="wrap">
    <div class="page-content">
      <div class="island">
        <div class="island-title">
          Account Details
        </div>
        <div class="island-content">
          <AccountBox :address="$route.params.address" />
          
          <div v-if="!accountDetail">Loading...</div>

          <div v-if="accountDetail">
            <p>
              Balance: <span v-html="$options.filters.formatToken(accountDetail.balance)"></span>
            </p>
          </div>
          
          <!--Transactions: (Click to scan for transactions. This can take a while.)-->

        </div>
        <div class="island-title" v-if="this.accountDetail && this.accountDetail.codehash">Contract</div>
        <div class="island-content" v-if="this.accountDetail && this.accountDetail.codehash">
          <ContractAbi :abi="contractAbi" :codehash="this.accountDetail.codehash" :address="$route.params.address" />
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
import ContractAbi from '../components/ContractAbi';

export default {
  data () {
    return {
      accountDetail: null,
      contractAbi: null
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
  },
  computed: {
  },
  methods: {
    async load() {
      let address = this.$route.params.address;
      this.accountDetail = await this.$store.dispatch('blockchain/getAccount', { address });
      if (this.accountDetail.codehash) {
        this.contractAbi = await this.$store.dispatch('blockchain/getABI', { address });
        this.contractAbi.foo = true;
        this.contractAbi.bar = 3;
      }
    },
    moment
  },
};
</script>

<style lang="scss">
</style>