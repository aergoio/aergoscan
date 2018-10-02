<template>
  <div id="app">
    <Header />
    <div class="page-container">
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
  max-width: 1000px;
}

.page-content {
  padding: 35px 0;
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

p { 
  line-height: 1.5;
  margin: 0 0 1em 0;
}


.island {
  background-color: #fff;

  .island-title {
    border-bottom: 1px solid #EBEBEB;
    padding: 20px;
    font-size: (16/14)*1rem;
    line-height: 1.2;
  }
}

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

.table-like {
  .row {
    border-bottom: 1px solid #EBEBEB;
    display: flex;

    &.header {
      text-transform: uppercase;
      font-weight: 500;
    }

    .cell {
      padding: 15px 10px;

      &:first-child {
        padding-left: 20px;
      }
      &:last-child {
        padding-right: 20px;
      }
    }
  }
}

</style>