import Vue from 'vue';
import App from './App.vue';
import MixinRedux from './elements/mixin-redux.js';
import store from './store.js';

import '@nimiq/style/nimiq-style.min.css';
import IqonsSvg from '@nimiq/iqons/dist/iqons.min.svg';
import '@nimiq/vue-components/dist/NimiqVueComponents.css';

// Set up Identicon SVG file path
if (IqonsSvg[0] === '"') {
    // @ts-ignore
    self.NIMIQ_IQONS_SVG_PATH = IqonsSvg.substring(1, IqonsSvg.length - 1);
} else {
    // @ts-ignore
    self.NIMIQ_IQONS_SVG_PATH = IqonsSvg;
}

if (window.hasBrowserWarning) {
    throw new Error('Exeution aborted due to browser warning');
}

Vue.config.productionTip = false;

// set redux store for x-elements
MixinRedux.store = store;

const app = new Vue({
    data: {
        loading: true,
        store: MixinRedux.store,
    },
    render: (h) => h(App),
}).$mount('#app');
