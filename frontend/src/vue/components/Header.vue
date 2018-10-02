<template>
  <div class="header">
    <div class="wrap">

      <div class="logo-wrap">
        <router-link :to="`/`" class="logo"></router-link>
      </div>

      <div class="main-nav">
        Blocks Transactions More
      </div>

      <div class="search">
        search
      </div>

    </div>
  </div>
</template>

<script>

export default {
  data () {
    return {
    }
  },
  created () {
  },
  beforeDestroy () {
  },
  computed: {
  },
  methods: {
  },
  components: {
  }
};
</script>

<style lang="scss" scoped>
.header {
  background-color: #1A1937;
  color: #fff;

  .wrap {
    display: flex;
  }
}

.logo-wrap {
  line-height: 100px;
}
.logo {
  display: inline-block;
  vertical-align: middle;
  background: url('~@assets/img/aergoscan.svg');
  width: 250px;
  height: 36px;
  background-size: auto 100%;
  background-repeat: no-repeat;
}

.main-nav {
  text-transform: uppercase;
}
</style>