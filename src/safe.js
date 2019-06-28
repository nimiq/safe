/*import { bindActionCreators } from 'redux';
import XLoader from './elements/x-loader.js';
import { default as store, Store } from './store.js';
import { updateBalances } from './wallet-redux.js';
import { addTransactions, markRemoved } from './elements/x-transactions/transactions-redux.js';
import { setConsensus, setHeight, setPeerCount, setGlobalHashrate } from './elements/x-network-indicator/network-redux.js';
import hubClient from './hub-client.js';
import Config from './config/config.js';
import networkClient from './network-client.js';
import XToast from './elements/x-toast/x-toast.js';

class Safe {
    constructor() {
        this._networkLaunched = false;
        this._consensusSyncing = false;
        this._consensusEstablished = false;

        // if browser warning is active, abort
        const warningTags = ['browser-outdated', 'browser-edge', 'no-local-storage', 'web-view', 'private-mode'];
        for (let warningTag of warningTags) {
            if (document.body.hasAttribute(warningTag)) return;
        }

        this.launchApp();
    }

    async launchApp() {
        this.store = store;

        // Launch account manager
        hubClient.launch();

        const $appContainer = document.getElementById('app');

        // start UI
        this._xApp = new XLoader($appContainer);

        this.launchNetwork();

        // Persist store before closing
        self.onunload = () => {
            if (!window.skipPersistingState) Store.persist();
        };
    }

}

window.safe = new Safe();*/
