
import 'whatwg-fetch';
import 'intersection-observer';
import Vue from 'vue';
import App from './App';
import VueRouter from 'vue-router';
import VueFetch from 'vue-fetch';
import routes from './config/routes';
import Button from './components/Button';
import store from './store/index';
import { shortAddress } from './filters/address';
import { formatToken } from './filters/format-token';
import { formatNumber } from './filters/format-number';


export default async function setup(opts) {
    Vue.use(VueRouter);
    Vue.use(VueFetch, { polyfill: true });

    Vue.component('Button', Button);
    Vue.filter('shortAddress', shortAddress);
    Vue.filter('formatToken', formatToken);
    Vue.filter('formatNumber', formatNumber);

    const router = new VueRouter({
        routes,
        mode: 'history',
    });

    const vue = new Vue({
        el: "#app",
        render: createElement => createElement(App),
        router,
        store
    });

    Vue.config.devtools = true;
}