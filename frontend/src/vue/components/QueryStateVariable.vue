<template>
  <div class="function-block">
    <span class="function">{{name}}</span>
    <span class="annotation">{{type}}</span>
    <span v-if="type === 'map'">
      <input type="text" v-model="mapKey" class="arg-field" placeholder="Key to query">
    </span>
    <span class="btn-call" v-if="!isLoading" v-on:click="queryContractState">Query</span>
    <span class="btn-call" v-if="isLoading">Loading...</span>
    <div v-if="typeof result !== 'undefined'" class="code-highlight-pre">→ <span v-html="syntaxHighlight(result)"></span></div>
  </div>
</template>

<script>
import { loadAndWait } from '../utils/async';
import { syntaxHighlight } from '../utils/syntax-highlight';

export default {
  props: ['abi', 'name', 'address'],
  computed: {
    variable() {
      const match = this.abi.state_variables.filter(variable => variable.name === this.name);
      if (!match.length) return {};
      return match[0];
    },
    type() {
      const variable = this.variable;
      if (variable) return variable.type;
      return '';
    }
  },
  data () {
    return {
      mapKey: '',
      result: void 0,
      isLoading: false,
    }
  },
  methods: {
    syntaxHighlight,
    async queryContractState() {
      const wait = loadAndWait();

      this.isLoading = true;
      this.result = void 0;

      let stateNames = [];
      const arrayLength = 10;
      if (this.type == 'array') {
        stateNames = [...Array(arrayLength).keys()].map(idx => `_sv_${this.name}-${idx+1}`);
      } else if (this.type == 'map') {
        stateNames = [`_sv_${this.name}-${this.mapKey}`];
      } else {
        stateNames = [`_sv_${this.name}`];
      }
      let result;
      try {
        result = await this.$store.dispatch('blockchain/queryContractState', {
          stateNames,
          abi: this.abi,
          address: this.address
        });
        result = JSON.stringify(result, undefined, 2).replace(']', "  ... array may have more items ...\n]");
      } catch(e) {
        console.log(e);
        result = {error: ''+e};
      }
      await wait();
      this.result = result;
      this.isLoading = false;
    },
  },
};
</script>

<style lang="scss">

</style>