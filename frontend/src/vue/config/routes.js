import Homepage from '../pages/Homepage.vue';
import Block from '../pages/Block.vue';

export default [
    { path: '/', component: Homepage },
    { path: '/block/:blockNoOrHash', component: Block },
];