<template>
  <router-link :to="`/account/${address}/`" class="account-box">

    <Identicon :text="address" size="50" />
    <span class="address">{{address}}</span>
  </router-link>
</template>

<script>
import Identicon from './Identicon';

export default {
  props: ['address'],
  data () {
    return {
    }
  },
  components: {
    Identicon,
  }
};
</script>

<style lang="scss">
.account-box {
  display: inline-block;
  border: 1px solid #e0e0e0;
  font-size: (13/16)*1rem;

  overflow: hidden;

  .identicon {
    float: left;
  }
  .address {
    line-height: 50px;
    margin: 0 10px;
  }
  &.null-address {
    padding: .5em;
  }
}
</style>
