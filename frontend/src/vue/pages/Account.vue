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

          <table class="detail-table" v-if="accountDetail">
            <tr><td>Balance:</td><td v-html="$options.filters.formatToken(accountDetail.balance)"></td></tr>
           
            <tr v-if="accountDetail.codehash">
              <td nowrap>Contract code:</td>
              <td class="monospace">{{formattedCode}}</td>
            </tr>
          </table>
          
          <!--Transactions: (Click to scan for transactions. This can take a while.)-->

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
  },
  computed: {
    formattedCode() {
      if (!this.accountDetail || !this.accountDetail.codehash) return '';
      const buf = Buffer.from(this.accountDetail.codehash);
      //return Buffer.from(this.accountDetail.codehash).toString();
      return Array.from(buf).map (b => b.toString (16).padStart (2, "0")).join (" ");
    }
  },
  methods: {
    load() {
      let address = this.$route.params.address;
      this.$store.dispatch('blockchain/getAccount', { address }).then(account => {
        this.$data.accountDetail = account;
      });
    },
    moment
  },
};
</script>

<style lang="scss">
</style>