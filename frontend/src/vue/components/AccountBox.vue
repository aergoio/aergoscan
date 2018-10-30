<template>
  <router-link :to="`/account/${address}/`" class="account-box">

    <Identicon :text="''+address" size="50" />
    <span class="address">{{''+address}}</span>
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

  display: flex;
  align-items: center;

  .identicon {
    
  }
  .address {
    flex: 1;
    line-height: 18px;
    margin: 0 7px;
    word-break: break-word;
  }
  &.null-address {
    padding: .5em;
  }
}
</style>
