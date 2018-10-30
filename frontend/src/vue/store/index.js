import Vuex from 'vuex';
import Vue from 'vue';
import navigation from './navigation';
import blockchain from './blockchain';

const debug = process.env.NODE_ENV !== 'production';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    navigation,
    blockchain
  },
  strict: debug
})