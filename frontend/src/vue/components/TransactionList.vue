<template>
  <div class="table-like">
    <div class="row header">
      <div class="cell" style="flex: 5">Hash</div>
      <div class="cell" style="flex: 5">From -> To</div>
      <div class="cell" style="flex: 2">Amount</div>
    </div>
    <div v-for="tx in items" :key="tx.hash" class="row clickable" v-on:click="viewTx(tx.hash)">
      <div class="cell" style="flex: 5">{{tx.hash}}</div>
      <div class="cell" style="flex: 5">{{tx.body.account}} -> {{tx.body.recipient}}</div>
      <div class="cell" style="flex: 2">{{tx.body.amount}}</div>
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
