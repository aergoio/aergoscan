<template>
  <div class="table-like">
    <div class="row header">
      <div class="cell" style="flex: 2" v-if="showTimes">Time</div>
      <div class="cell" style="flex: 5">Hash</div>
      <div class="cell" style="flex: 4">From -> To</div>
      <div class="cell" style="flex: 2">Amount</div>
      <div class="cell"><span class="icon icon-view" style="visibility: hidden"></span></div>
    </div>
    <div v-for="tx in items" :key="tx.hash" class="row clickable" v-on:click="viewTx(tx.hash)">
      <div class="cell" style="flex: 2" v-if="showTimes">{{moment(tx.ts).fromNow()}}</div>
      <div class="cell hash" style="flex: 5">{{tx.hash}}</div>
      <div class="cell" style="flex: 4" v-if="!baseAccount">{{tx.from | shortAddress}} -> {{tx.to | shortAddress}}</div>
      <div class="cell" style="flex: 4;" v-if="baseAccount">
        <span v-if="baseAccount == tx.from"><span class="label label-positive">to</span>&nbsp;{{tx.to | shortAddress}}</span>
        <span v-if="baseAccount == tx.to"><span class="label label-negative">from</span>&nbsp;{{tx.from | shortAddress}}</span>
      </div>
      <div class="cell" style="flex: 2" v-html="$options.filters.formatToken(tx.amount)"></div>
      <div class="cell"><span class="icon icon-view"></span></div>
    </div>
  </div>
</template>

<script>
import Identicon from './Identicon';
import moment from 'moment';

export default {
  props: ['items', 'showTimes', 'baseAccount'],
  data () {
    return {
    }
  },
  components: {
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
