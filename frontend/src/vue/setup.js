
import 'whatwg-fetch';
import 'intersection-observer';
import Vue from 'vue';
import App from './App';
import VueRouter from 'vue-router';
import VueFetch from 'vue-fetch';
import routes from './config/routes';
import Button from './components/Button';
import { Island, IslandHeader } from "aergo-ui/src/components/layout";
import store from './store/index';
import { shortAddress } from './filters/address';
import { formatToken, formatGenericToken } from './filters/format-token';
import { formatNumber } from './filters/format-number';
import { tooltip } from './directives/tooltip';


export default async function setup(opts) {
    Vue.use(VueRouter);
    Vue.use(VueFetch, { polyfill: true });
    Vue.directive('tooltip', tooltip);

    Vue.component('Button', Button);
    Vue.component('Island', Island);
    Vue.component('IslandHeader', IslandHeader);
    Vue.filter('shortAddress', shortAddress);
    Vue.filter('formatToken', formatToken);
    Vue.filter('formatGenericToken', formatGenericToken);
    Vue.filter('formatNumber', formatNumber);

    const router = new VueRouter({
        routes,
        mode: 'history',
        scrollBehavior (from, to, savedPosition) {
            if (from.path !== to.path) {
                return { x: 0, y: 0 }
            }
            return savedPosition;
        }
    });

    const vue = new Vue({
        el: "#app",
        render: createElement => createElement(App),
        router,
        store
    });

    Vue.config.devtools = true;
}
