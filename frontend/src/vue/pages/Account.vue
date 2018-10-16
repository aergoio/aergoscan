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
              Balance: <span v-html="$options.filters.formatToken(accountDetail.balance)" />
            </p>
            <p v-if="accountDetail.codehash">
              Contract code: {{accountDetail.codehash}}
            </p>

              <!--Transactions: (Click to scan for transactions. This can take a while.)-->
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