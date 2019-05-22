import Vue from 'vue';
import App from './App.vue';
import MixinRedux from './elements/mixin-redux.js';
import store from './store.js';

import XToast from './elements/x-toast/x-toast.js';
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

const errorBlacklist = ['CANCELED', 'Request aborted', 'Connection was closed'];
self.onerror = (error) => {
    if (errorBlacklist.indexOf(error.message) >= 0) return;
    XToast.show(error.message || error, 'error');
};

// cancel request and close window when there is an unhandled promise rejection
self.onunhandledrejection = (event) => {
    if (errorBlacklist.indexOf(event.reason.message) >= 0) return;
    XToast.show(event.reason, 'error');
};

const app = new Vue({
    data: {
        loading: true,
        store: MixinRedux.store,
    },
    render: (h) => h(App),
}).$mount('#app');
