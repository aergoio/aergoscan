<template>
  <div class="wrap">
    <div class="page-content">
      <div class="island">
        <div class="island-title">
          Transaction Details
          <div v-if="!txDetail">Loading...</div>
          <div v-if="txDetail" class="subtitle">{{txDetail.tx.hash}}</div>
        </div>
        <div class="island-content">
          
          <div v-if="txDetail">
            <div class="transaction-flow-diagram">
              <AccountBox :address="txDetail.tx.from" />
              <span class="flow-arrow"></span>
              <AccountBox :address="txDetail.tx.to" />
            </div>
            
            <p>
              Amount: {{txDetail.tx.amount}}<br>
              Nonce: {{txDetail.tx.nonce}}
            </p>

            <div v-if="txDetail.block">
              Included in block:
              <router-link :to="`/block/${txDetail.block.hash}/`">{{txDetail.block.hash}}</router-link>.
            </div>
            
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