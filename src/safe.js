import { bindActionCreators } from 'redux';
import XLoader from './elements/x-loader.js';
import MixinRedux from './elements/mixin-redux.js';
import { default as store, Store } from './store.js';
import { updateBalances } from './wallet-redux.js';
import { addTransactions, markRemoved } from './elements/x-transactions/transactions-redux.js';
import { setConsensus, setHeight, setPeerCount, setGlobalHashrate } from './elements/x-network-indicator/network-redux.js';
import hubClient from './hub-client.js';
import Config from './lib/config.js';
import networkClient from './network-client.js';
import MixinSingleton from './elements/mixin-singleton.js';
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
        // set redux store
        this.store = store;
        MixinRedux.store = this.store;

        // Launch account manager
        hubClient.launch();

        const $appContainer = document.getElementById('app');

        // set singleton app container
        MixinSingleton.appContainer = $appContainer;

        // start UI
        this._xApp = new XLoader($appContainer);

        this.actions = bindActionCreators({
            updateBalances,
            addTransactions,
            markRemoved,
            setConsensus,
            setHeight,
            setPeerCount,
            setGlobalHashrate
        }, this.store.dispatch);

        this.launchNetwork();

        // Persist store before closing
        self.onunload = () => {
            if (!window.skipPersistingState) Store.persist();
        };

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
    }

    async launchNetwork() {
        if (Config.offline) return;

        // Launch network
        networkClient.launch();
        if (location.origin === 'https://my.nimiq.com' && !this._networkLaunched) {
            this._networkLaunched = true;
            _paq && _paq.push(['trackEvent', 'Network', 'Consensus', 'initialize', Math.round(performance.now() / 100) / 10]);
        }

        this.network = await networkClient.client;
        window.network = this.network; // for debugging

        // Subscribe to network events
        this.network.on('nimiq-api-ready', () => console.log('NanoNetworkApi ready'));
        this.network.on('nimiq-consensus-syncing', this._onConsensusSyncing.bind(this));
        this.network.on('nimiq-consensus-established', this._onConsensusEstablished.bind(this));
        this.network.on('nimiq-consensus-lost', this._onConsensusLost.bind(this));
        this.network.on('nimiq-balances', this._onBalanceChanged.bind(this));
        this.network.on('nimiq-different-tab-error', e => alert('Nimiq is already running in a different tab.'));
        this.network.on('nimiq-api-fail', e => alert('Nimiq initialization error:', e.message || e));
        this.network.on('nimiq-transaction-pending', this._onTransaction.bind(this));
        this.network.on('nimiq-transaction-expired', this._onTransactionExpired.bind(this));
        this.network.on('nimiq-transaction-mined', this._onTransaction.bind(this));
        this.network.on('nimiq-transaction-relayed', this._onTransactionRelayed.bind(this));
        this.network.on('nimiq-peer-count', this._onPeerCountChanged.bind(this));
        this.network.on('nimiq-head-change', this._onHeadChange.bind(this));
    }

    // todo refactor: move following methods to new class NetworkHandler(?)

    _onConsensusSyncing() {
        console.log('Consensus syncing');
        this.actions.setConsensus('syncing');
        if (location.origin === 'https://my.nimiq.com' && !this._consensusSyncing) {
            this._consensusSyncing = true;
            _paq && _paq.push(['trackEvent', 'Network', 'Consensus', 'start-syncing', Math.round(performance.now() / 100) / 10]);
        }
    }

    _onConsensusEstablished() {
        console.log('Consensus established');
        this.actions.setConsensus('established');
        if (location.origin === 'https://my.nimiq.com' && !this._consensusEstablished) {
            this._consensusEstablished = true;
            _paq && _paq.push(['trackEvent', 'Network', 'Consensus', 'established', Math.round(performance.now() / 100) / 10]);
        }
    }

    _onConsensusLost() {
        console.log('Consensus lost');
        this.actions.setConsensus('lost');
    }

    _onBalanceChanged(balances) {
        this.actions.updateBalances(balances);
    }

    _onTransaction(tx) {
        // Check if we know the sender or recipient of the tx
        const accounts = this.store.getState().wallets.accounts;
        if (!accounts.has(tx.sender) && !accounts.has(tx.recipient)) {
            console.warn('Not displaying transaction because sender and recipient are unknown:', tx);
            return;
        }

        this.actions.addTransactions([tx]);
    }

    _onTransactionExpired(hash) {
        this.actions.markRemoved([hash], this.store.getState().network.height + 1);
    }

    _onTransactionRelayed(tx) {
        this._onTransaction(tx);

        const resolver = this._xApp.relayedTxResolvers.get(tx.hash);
        resolver && resolver();
    }

    _onHeadChange({height, globalHashrate}) {
        this.actions.setHeight(height);
        this.actions.setGlobalHashrate(globalHashrate);
    }

    _onPeerCountChanged(peerCount) {
        this.actions.setPeerCount(peerCount);
    }
}

window.safe = new Safe();
