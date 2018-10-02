<template>
  <div class="wrap">
    <div class="page-content">
      <div class="island">
        <div class="island-title">Blocks</div>
        <div class="island-content table-like" style="height: 300px; overflow: hidden;">
          <div class="row header">
            <div class="cell">Number</div>
            <div class="cell">Time</div>
            <div class="cell">Transactions</div>
          </div>
          <transition-group name="animated-list" tag="div">
            <div class="row clickable" v-for="block in reverseBlocks" :key="block.blockno" v-on:click="viewBlock(block.blockno)">
              <div class="cell">{{block.blockno}}</div>
              <div class="cell">{{moment(block.timestamp/1000000).format('HH:mm:ss')}}</div>
              <div class="cell">0 tx</div>
              <div class="cell"><span class="icon icon-view"></span></div>
            </div>
          </transition-group>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import moment from 'moment';
import { mapState, mapActions } from 'vuex'

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
      blocks: state => state.blockchain.blocks
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
.animated-list-enter-active, .list-leave-active {
  transition: all .75s;
}
.animated-list-enter, .list-leave-to /* .list-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>