<template>
  <span class="reload-button" v-on:click="reload()" :class={loading}></span>
</template>

<script>
import { loadAndWait } from '../utils/async';
export default {
  props: ['action'],
  data () {
    return {
      loading: false
    }
  },
  methods: {
    async reload() {
      this.loading = true;
      const promise = this.$props.action();
      const waitMinimum = loadAndWait();
      const finishLoading = async () => {
        await waitMinimum();
        this.loading = false;
      };
      if (promise instanceof Promise) {
        promise.finally(finishLoading);
      } else {
        setTimeout(finishLoading, 500);
      }
    }
  }
};
</script>

<style lang="scss">
.reload-button {
  display: inline-block;
  width: 21px;
  height: 17px;
  vertical-align: middle;
  background: url('~@assets/img/reload.svg');
  background-size: auto 100%;
  background-repeat: no-repeat;
  cursor: pointer;

  &.loading {
    animation: spin .7s infinite linear;
    transform-origin: 50% 50%;
  }
}
@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(-360deg); }
}
</style>

