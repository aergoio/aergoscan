<template>
  <div class="table-like">
    <div class="row header">
      <div class="cell" style="flex: 2" v-if="showTimes">Time</div>
      <div class="cell" style="flex: 5">Hash</div>
      <div class="cell" style="flex: 4">From -> To</div>
      <div class="cell" style="flex: 2">Amount</div>
      <div class="cell"><span class="icon icon-view" style="visibility: hidden"></span></div>
    </div>
    

    <RecycleScroller class="scroller" :items="items" :item-height="scrollerItemHeight" keyField="hash" page-mode>
      <div slot-scope="{ item }" class="row clickable linearize" v-on:click="viewTx(item.hash)">
        <div class="cell" style="flex: 2" v-if="showTimes" :title="moment(item.ts)">{{moment(item.ts).fromNow()}}</div>
        <div class="cell hash" style="flex: 5">{{item.hash}}</div>
        <div class="cell" style="flex: 4" v-if="!baseAccount">{{item.from | shortAddress}} -> {{item.to | shortAddress}}</div>
        <div class="cell" style="flex: 4;" v-if="baseAccount && item.from !== item.to">
          <span v-if="baseAccount == item.from"><span class="label label-positive">to</span>&nbsp;{{item.to | shortAddress}}</span>
          <span v-if="baseAccount == item.to"><span class="label label-negative">from</span>&nbsp;{{item.from | shortAddress}}</span>
        </div>
        <div class="cell" style="flex: 4;" v-if="baseAccount && item.from === item.to"><span class="label label-neutral">self transfer</span></div>
        <div class="cell" style="flex: 2" v-html="$options.filters.formatToken(item.amount)"></div>
        <div class="cell"><span class="icon icon-view"></span></div>
      </div>
    </RecycleScroller>
  </div>
</template>

<script>
import Identicon from './Identicon';
import moment from 'moment';
import { RecycleScroller } from 'vue-virtual-scroller'

export default {
  props: ['items', 'showTimes', 'baseAccount'],
  data () {
    return {
    }
  },
  components: {
    RecycleScroller,
  },
  computed: {
    scrollerItemHeight() {
      const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      return width >= 640 ? 45 : 175;
    }
  },
  methods: {
    viewTx (hash) {
      this.$router.push({ name: 'transaction', params: { hash }});
    },
    moment
  },
};
</script>

<style lang="scss">
</style>
