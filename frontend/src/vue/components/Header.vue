<template>
  <div class="header">
    <div class="wrap">

      <div class="logo-wrap">
        <router-link :to="`/`" class="logo"></router-link>
      </div>

      <div class="main-nav">
        <router-link :to="`/`">Dashboard</router-link>
        <router-link :to="`/developers`">Developers</router-link>
        <!--<router-link :to="`/foo`">Transactions</router-link>-->
      </div>

      <form class="search" v-on:submit.native="performSearch">
        <div class="search-wrap">
          <input type="search" v-model="query" class="search-field" placeholder="Search for address, tx hash, block height" v-on:keyup="predictSearch">
          <div v-if="predictedType" class="search-prediction" v-on:click="performSearch">
            Do you mean 
            <span v-if="predictedType == 'blockno'">
              <span class="type">block number</span>
              <span class="value">{{predictedString}}</span>
            </span>
            <span v-if="predictedType == 'blockhash'">
              <span class="type">block hash</span>
              <span class="value">{{predictedString}}</span>
            </span>
            <span v-if="predictedType == 'txhash'">
              <span class="type">transaction hash</span>
              <span class="value">{{predictedString}}</span>
            </span>
            <span v-if="predictedType == 'address'">
              <span class="type">account address</span>
              <span class="value">{{predictedString}}</span>
            </span>
            ?
          </div>
        </div>
      </form>

    </div>
  </div>
</template>

<script>

export default {
  data () {
    return {
      query: '',
      predictedType: null,
      predictedString: ''
    }
  },
  created () {
  },
  beforeDestroy () {
  },
  computed: {
  },
  methods: {
    predictSearch() {
      console.log('predict', this.query);
      if ('' + parseInt(this.query) === this.query) {
        this.predictedType = 'blockno';
        this.predictedString = ''+parseInt(this.query);
      } else if (this.query.length === 64) {
        this.predictedType = 'blockhash';
        this.predictedString = this.query;
      }
    },
    performSearch() {
      if (this.predictedType === 'blockno' || this.predictedType === 'blockhash') {
        this.$router.push(`/block/${this.predictedString}`);
      }
      if (this.predictedType === 'address') {
        this.$router.push(`/account/${this.predictedString}`);
      }
      if (this.predictedType === 'txhash') {
        this.$router.push(`/transaction/${this.predictedString}`);
      }
      this.predictedType = '';
    }
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

    :last-child {
      flex: 1
    }
  }
}

.logo-wrap {
  line-height: 100px;
}
.logo {
  display: inline-block;
  vertical-align: middle;
  background: url('~@assets/img/aergoscan.svg');
  width: 220px;
  height: 36px;
  background-size: auto 100%;
  background-repeat: no-repeat;
  margin-right: 60px;
}

.main-nav {
  text-transform: uppercase;
  margin-right: 60px;

  a {
    color: inherit;
    font-size: (16/13)*1em;
    text-decoration: none;
    line-height: 65px;
    border-top: 6px solid transparent;
    vertical-align: top;
    display: inline-block;
    margin-right: 30px;

    transition: color .25s;

    &:hover {
      color: #F90F5F;
    }

    &.router-link-exact-active {
      border-color: #F90F5F;
    }
  }
}

.search {
  padding: 25px 0;

  .search-wrap {
    position: relative;
  }

  .search-prediction {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin: 0 20px;
    background-color: #F90F5F;
    color: #fff;
    padding: 7px 8px 8px;
    cursor: pointer;

    .type {
      font-weight: 500;
    }
  }
}

.search-field {
  background: transparent;
  border: 3px solid #F90F5F;
  border-radius: 100px;
  padding: 0 20px;
  line-height: 40px;
  width: 100%;
  box-sizing: border-box;
  color: #fff;
  font-size: 1.25em;
  appearance: textfield;

  &::placeholder {
    color: rgba(255,255,255,0.7);
    opacity: 1;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 2px rgba(255,255,255,0.5);
  }
}
</style>