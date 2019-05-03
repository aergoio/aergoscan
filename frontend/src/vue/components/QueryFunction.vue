<template>
  <div class="function-block">
    <span class="function">{{name}}</span>(<span v-if="func.arguments.length">{<br>
      <span v-for="(arg, idx) in func.arguments" :key="arg.name">
        &nbsp;&nbsp;<span class="key">{{arg.name}}</span>: <input type="text" v-model="args[arg.name]" class="arg-field"> <span v-if="idx!=func.arguments.length-1">, </span><br>
      </span>
    }</span>)
    <span class="btn-call" v-if="!isLoading" v-on:click="queryContract">Query</span>
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
    func() {
      return this.abi.functions.find(func => func.name === this.name) || {};
    }
  },
  data () {
    return {
      args: {},
      result: void 0,
      isLoading: false,
    }
  },
  methods: {
    syntaxHighlight,
    async queryContract() {
      const wait = loadAndWait();

      const args = this.args;
      const argValues = this.func.arguments.map(arg => args[arg.name]);
      if (argValues.some(item => typeof item === 'undefined')) {
        this.result = {
          error: 'You did not provide all arguments'
        };
        return;
      }

      this.isLoading = true;
      this.result = void 0;

      let result;
      try {
        result = await this.$store.dispatch('blockchain/queryContract', {
          name: this.name,
          args: argValues,
          abi: this.abi,
          address: this.address
        });
      } catch(e) {
        console.log(e);
        let errorMsg;
        try {
          errorMsg = e.metadata.headersMap['grpc-message'];
        } catch(_) {
          errorMsg = e;
        }
        result = { error: errorMsg };
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