import Homepage from '../pages/Homepage.vue';
import Block from '../pages/Block.vue';
import Transaction from '../pages/Transaction.vue';
import Account from '../pages/Account.vue';
import Developers from '../pages/Developers.vue';
import Peers from '../pages/Peers.vue';

export default [
    { path: '/', component: Homepage },
    { path: '/block/:blockNoOrHash', component: Block, name: 'block' },
    { path: '/transaction/:hash', component: Transaction, name: 'transaction' },
    { path: '/account/:address', component: Account, name: 'account' },
    { path: '/peers/', component: Peers, name: 'peers' },
    { path: '/developers', component: Developers, name: 'developers' },
];