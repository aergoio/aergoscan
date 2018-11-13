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

      <form class="search" v-on:submit.prevent.capture="performSearch">
        <div class="search-wrap">
          <input type="search" v-model="query" class="search-field" placeholder="Search for address, tx hash, block hash or height" v-on:keyup="predictSearch" v-on:keyup.enter="performSearch">
          <div v-if="predictedType" class="search-prediction">
            
            <div v-if="predictedType == 'blockno'" v-on:click="gotoBlock(predictedString)">
              Do you mean 
              <span class="type">block number</span>
              <span class="value">{{predictedString}}</span>?
            </div>
            <div v-if="predictedType == 'hash'" v-on:click="gotoBlock(predictedString)">
              Do you mean 
              <span class="type">block hash</span>
              <span class="value">{{predictedString}}</span>?
            </div>
            <div v-if="predictedType == 'hash'" v-on:click="gotoTransaction(predictedString)">
              Do you mean 
              <span class="type">transaction hash</span>
              <span class="value">{{predictedString}}</span>?
            </div>
            <div v-if="predictedType == 'address'" v-on:click="gotoAccount(predictedString)">
              Do you mean 
              <span class="type">account address</span>
              <span class="value">{{predictedString}}</span>?
            </div>
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
      if ('' + parseInt(this.query) === this.query) {
        this.predictedType = 'blockno';
        this.predictedString = ''+parseInt(this.query);
      } else if (this.query[0] == 'A') {
        this.predictedType = 'address';
        this.predictedString = this.query;
      } else {
        this.predictedType = 'hash';
        this.predictedString = this.query;
      } 
    },
    gotoBlock(numberOrHash) {
      this.$router.push(`/block/${numberOrHash}`);
      this.predictedType = '';
    },
    gotoAccount(address) {
      this.$router.push(`/account/${address}`);
      this.predictedType = '';
    },
    gotoTransaction(hash) {
      this.$router.push(`/transaction/${hash}`);
      this.predictedType = '';
    },
    performSearch() {
      if (this.predictedType === 'blockno') {
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

    @media (max-width: 40em) {
      flex-direction: column;
      align-items: center;
    }

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
}

.main-nav, .logo {
  @media (min-width: 40em) {
    margin-right: 60px;
  }
}

.main-nav {
  text-transform: uppercase;

  a {
    color: inherit;
    font-size: (16/13)*1em;
    text-decoration: none;
    line-height: 40px;
    @media (min-width: 40em) {
      line-height: 65px;
    }
    @media (max-width: 40em) {
      border-bottom: 3px solid transparent;
    }
    @media (min-width: 40em) {
      border-top: 6px solid transparent;
    }
    

    vertical-align: top;
    display: inline-block;
    margin-right: 30px;

    &:last-child {
      margin-right: 0;
    }

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

  @media (max-width: 40em) {
    width: 100%;
  }

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
    
    cursor: pointer;

    .type {
      font-weight: 700;
    }

    > div {
      padding: 7px 8px 8px;

      & + div {
        border-top: 1px solid #fff;
      }
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