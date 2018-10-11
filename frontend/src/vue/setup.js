
import 'whatwg-fetch';
import Vue from 'vue';
import App from './App';
import VueRouter from 'vue-router';
import VueFetch from 'vue-fetch';
import routes from './config/routes';
import Button from './components/Button';
import store from './store/index';
import { shortAddress } from './filters/address';


export default async function setup(opts) {
    Vue.use(VueRouter);
    Vue.use(VueFetch, { polyfill: true });

    Vue.component('Button', Button);
    Vue.filter('shortAddress', shortAddress);

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