<template>
  <div class="table-like">
    <div class="row header">
      <div class="cell" style="flex: 5">Hash</div>
      <div class="cell" style="flex: 5">From -> To</div>
      <div class="cell" style="flex: 2">Amount</div>
      <div class="cell"><span class="icon icon-view" style="visibility: hidden"></span></div>
    </div>
    <div v-for="tx in items" :key="tx.hash" class="row clickable" v-on:click="viewTx(tx.hash)">
      <div class="cell hash" style="flex: 5">{{tx.hash}}</div>
      <div class="cell" style="flex: 5">{{tx.from}} -> {{tx.to}}</div>
      <div class="cell" style="flex: 2" v-html="$options.filters.formatToken(tx.amount)"></div>
      <div class="cell"><span class="icon icon-view"></span></div>
    </div>
  </div>
</template>

<script>
import Identicon from './Identicon';

export default {
  props: ['items'],
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
  },
};
</script>

<style lang="scss">
</style>
