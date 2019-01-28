import "./assets/style/main.scss";

import setupVue from './vue/setup';
import cfg from './config.js';

if (cfg.NODE_ENV === 'production') {
    Sentry.init({ dsn: 'https://bdb97907aed041a6b546f5b5d021bf01@sentry.io/1311780' });
}

init();

async function init() {
    setupVue();
}