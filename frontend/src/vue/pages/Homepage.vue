<template>
  <div class="wrap">
    <div class="page-content">

      <div class="side-by-side">
        <div class="island">
          <div class="island-title">Blocks</div>
          <RecentBlocks class="island-content" />
        </div>

        <div class="island">
          <div class="island-title">Transactions</div>
          <RecentTransactions class="island-content" />
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import moment from 'moment';
import { mapState, mapActions } from 'vuex'
import RecentBlocks from '../components/RecentBlocks';
import RecentTransactions from '../components/RecentTransactions';

export default {
  data () {
    return {
    }
  },
  created () {
  },
  mounted () {
    this.$store.dispatch('blockchain/streamBlocks');
  },
  beforeDestroy () {
  },
  computed: {
    ...mapState({
      blocks: state => state.blockchain.recentBlocks
    }),
    reverseBlocks() {
      return this.blocks.slice().reverse();
    }
  },
  methods: {
    viewBlock (blockNo) {
      this.$router.push(`/block/${blockNo}`);
    },
    moment
  },
  components: {
    RecentBlocks,
    RecentTransactions
  }
};
</script>

<style lang="scss">
.icon {
  display: inline-block;
  width: 12px;
  height: 12px;
  background-repeat: no-repeat;
  background-size: contain;
}
.icon-view {
  background-image: url('~@assets/img/view.svg');
}
.animated-list-move {
  transition: transform .75s;
}
.animated-list-enter-active/*, .animated-list-leave-to*/ {
  transition: all .75s;
}
.animated-list-enter, .animated-list-leave-to {
  opacity: 0;
}

</style>