<template>
  <div id="app">
    <Header />
    <div class="page-container">
      <!--
      <div class="temp-notice">
        <strong>Notice (2018/11/16):</strong>
        The pre-testnet is up and running, but aergoscan is having some issues. We'll be back soon.
      </div>-->
      <TransitionPage>
        <router-view></router-view>
      </TransitionPage>
    </div>
    <Footer />
  </div>
</template>

<script>
import Header from './components/Header';
import Footer from './components/Footer';
import TransitionPage from './components/TransitionPage';

export default {
  data () {
    return {

    }
  },
  created() {
    this.$store.dispatch('blockchain/updateChainInfo');
  },
  beforeDestroy () {
  },
  computed: {
  },
  methods: {
   
  },
  components: {
    Header,
    Footer,
    TransitionPage
  }
};
</script>

<style lang="scss">
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  > div {
    flex: 1;

    &:first-child, &:last-child {
      flex: 0 0 auto;
    }
  }
}

body {
  background-color: #F3F5F7;
}


.wrap {
  margin: 0 auto;
  max-width: 1200px;
  padding: 0 15px;
}

.page-content {
  padding: 30px 0 60px;
}


.form {
  margin: 10px;

  .form-line {
    padding: 5px 3px;

    border-bottom: 1px solid #DFDFDF;
    &:last-of-type {
      border-bottom: 0;
    }
  
    label {
      font-weight: 500;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}

.form-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0 0;
}

.text-input {
  border: 1px solid #C6C6C6;
  border-radius: 4px;
  line-height: 22px;
  padding: 0 6px;
  font-weight: normal;
}

h2, strong {
  font-weight: 500;
  font-size: 1em;
}

p, ul { 
  line-height: 1.5;
  margin: 0 0 1em 0;
}

h3 {
  font-size: 1em;
  font-weight: medium;
  margin: 0 0 1em 0;
}

a {
  color: inherit;
  text-decoration: none;
}
.page-content {
  a {
    border-bottom: 2px solid #e7e7e7;

    &:hover {
      border-color: #bbb;
    }
  }
}

/*

.island {
  background-color: #fff;
  margin-bottom: 25px;

  .island-title {
    border-bottom: 1px solid #EBEBEB;
    padding: 16px 20px;
    font-size: (16/14)*1rem;
    line-height: 1.4;

    .subtitle {
      font-weight: 500;
    }
  }
  .island-content:not(.table-like) + .island-title {
    margin-top: -32px;
  }
}
*/

.island-content {
  padding: 20px;

  &.table-like {
    padding: 0;
    margin-top: 10px;
  }
}

.clickable {
  cursor: pointer;
}

.monospace, .hash, pre {
  font-family: 'SourceCodePro', monospace;
  word-break: break-all;
}
pre {
  white-space: pre-wrap;
  line-height: 1.3;
}
.hash {
  font-size: .9em;
  min-width: 13em;
}

.table-like {
  .row {
    border-bottom: 1px solid #EBEBEB;
    display: flex;
    align-items: baseline;

    &.header {
      text-transform: uppercase;
      font-weight: 500;
    }

    &.clickable:hover {
      background-color: rgba(0,0,0,0.025);
    }

    .cell {
      padding: 15px 10px;
      box-sizing: border-box;

      @media (max-width: 40em) {
        padding: 15px 20px;

        + .cell {
          padding-top: 0;
        }
      }

      &:first-child {
        padding-left: 20px;
      }
      &:last-child {
        padding-right: 20px;
        text-align: right;

        &:first-child {
          /* = only child */
          text-align: center;
          flex: 1;
        }
      }
      &:nth-last-child(2) {
        padding-right: 20px;
        text-align: right;
        flex: 1;
      }
    }

    &.linearize {
      @media (max-width: 40em) {
        flex-direction: column;


      }
    }
  }
}

.detail-table {
  margin: 30px auto;
  td {
    padding-right: 15px;
    vertical-align: top;
  }
}

.side-by-side {
  display: flex;

  @media (max-width: 50em) {
    flex-direction: column;
  }

  > * {
    flex: 1;

    @media (min-width: 50em) {
      margin-right: 30px;
    }
    

    &:last-child {
      margin-right: 0;
    }
  }
}

.text-field {

}

.formatted-value {
  white-space: nowrap;

  &.token {
    background-color: #f0f0f0;
    padding: 0 3px;
  }
  .unit {

  }
  .value {
    font-weight: 500;
  }
  .sep {
    display: inline-block;
    width: 4px;
  }
  .point {
    display: inline-block;
    padding: 0 2px;
  }
}

.label {
  display: inline-block;
  vertical-align: text-bottom;
  text-transform: uppercase;
  font-size: .85em;
  background-color: #eee;
  line-height: 1.5;
  padding: 0 .4em;
  border-radius: 4px;

  &.label-positive {
    background-color: #13c329;
    color: #fff;
  }
  &.label-negative {
    background-color: #f57336;
    color: #fff;
  }
  &.label-action {
    font-weight: 500;
  }
}

.error {
  color: #d20811;
}

.temp-notice {
  text-align: center;
  background-color: #ff005d;
  padding: 6px;
  color: #fff;
}

.data-table {
  width: 100%;
  border-collapse: collapse;

  thead {
    th {
      text-align: left;
      font-weight: 500;
      white-space: nowrap;

      &.sortable {
        cursor: pointer;
        user-select: none;

        &.sorted:after {
          content: " ⊤";
        }
        &.sorted.sortingAsc:after {
          content: " ⊥";
        }
      }
    }
  }
  td, th {
    border-bottom: 1px solid #ddd;
    padding: .75em;
  }
}

.kv-table {
  background-color: #FAFAFA;
  border-collapse: collapse;
  min-width: 350px;
  margin: 0 0 1em;
  
  td, th {
    border-bottom: 1px solid #E4E4E4;
    line-height: 2rem;
    padding: 0 1rem 0 .75rem;
  }
  th {
    font-weight: 500;
    text-align: left;
    white-space: nowrap;
  }
  tr:last-child {
    td, th {
      border-bottom: 0;
    }
  }
}

.scroll-list {
  overflow-y: scroll;

  &::-webkit-scrollbar {
      width: 8px;
  }

  &:hover {
    &::-webkit-scrollbar {
      background-color: transparent;
      width: 8px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: rgba(0,0,0,.2)
    }
  }
}
.icon {
  display: inline-block;
  width: 12px;
  height: 12px;
  background-repeat: no-repeat;
  background-size: contain;
}
.icon-medium {
  width: 17px;
  height: 17px;
}
.icon-view {
  background-image: url('~@assets/img/view.svg');
}
.icon-success {
  background-image: url('~@assets/img/icon-success.svg');
}
.icon-fail {
  background-image: url('~@assets/img/icon-fail.svg');
}

.has-tooltip {
  border-bottom: 1px dashed #aaa;
  cursor: help;
}
</style>