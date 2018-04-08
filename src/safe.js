import XSafe from './elements/x-safe.js';
import { bindActionCreators } from '/libraries/redux/src/index.js';
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js';
import { default as store, Store } from './store.js';
import { updateBalances, setAllKeys } from '/elements/x-accounts/accounts-redux.js';
import { addTransactions, markRemoved } from '/elements/x-transactions/transactions-redux.js';
import { setConsensus, setHeight,
    setPeerCount, setGlobalHashrate } from '/elements/x-network-indicator/network-redux.js';
import accountManager from '/libraries/account-manager/account-manager.js';
import Config from '/libraries/secure-utils/config/config.js'; // Config needs to be imported before networkClient
import networkClient from './network-client.js';
import MixinSingleton from '/secure-elements/mixin-singleton/mixin-singleton.js';
import XToast from '/secure-elements/x-toast/x-toast.js';

class Safe {
    constructor() {
        if (localStorage.getItem('lock')) {
            alert("Safe is locked");
        } else {
            this.launchApp();
        }
    }

    launchApp() {
        const $appContainer = document.querySelector('#app');

        // set redux store
        this.store = store;
        MixinRedux.store = this.store;

        // set singleton app container
        MixinSingleton.appContainer = $appContainer;

        // Launch account manager
        accountManager.launch();

        // start UI
        this._xApp = new XSafe($appContainer);

        // FIXME
        setTimeout(() => document.body.classList.remove('preparing'));

        this.actions = bindActionCreators({
            setAllKeys,
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

        self.onerror = (error) => {
            XToast.show(error.message, 'error');
        };

        // cancel request and close window when there is an unhandled promise rejection
        self.onunhandledrejection = (event) => {
            XToast.show(event.reason, 'error');
        };

        // TODO just temporary code
        if (window.location.hash.indexOf('enable-ledger') !== -1) {
            document.body.classList.add('enable-ledger');
        }
    }

    async launchNetwork() {
        if (Config.offline) return;

        // Launch network
        networkClient.launch();

        // launch network rpc client
        this.network = await networkClient.rpcClient;
        window.network = this.network; // for debugging

        // launch network event client
        this.networkListener = await networkClient.eventClient;
        this.networkListener.on('nimiq-api-ready', () => console.log('NanoNetworkApi ready'));
        this.networkListener.on('nimiq-consensus-syncing', this._onConsensusSyncing.bind(this));
        this.networkListener.on('nimiq-consensus-established', this._onConsensusEstablished.bind(this));
        this.networkListener.on('nimiq-consensus-lost', this._onConsensusLost.bind(this));
        this.networkListener.on('nimiq-balances', this._onBalanceChanged.bind(this));
        this.networkListener.on('nimiq-different-tab-error', e => alert('Nimiq is already running in a different tab.'));
        this.networkListener.on('nimiq-api-fail', e => alert('Nimiq initialization error:', e.message || e));
        this.networkListener.on('nimiq-transaction-pending', this._onTransaction.bind(this));
        this.networkListener.on('nimiq-transaction-expired', this._onTransactionExpired.bind(this));
        this.networkListener.on('nimiq-transaction-mined', this._onTransaction.bind(this));
        this.networkListener.on('nimiq-peer-count', this._onPeerCountChanged.bind(this));
        this.networkListener.on('nimiq-head-change', this._onHeadChange.bind(this));
    }

    // todo refactor: move following methods to new class NetworkHandler(?)

    _onConsensusSyncing() {
        console.log('Consensus syncing');
        this.actions.setConsensus('syncing');
    }

    _onConsensusEstablished() {
        console.log('Consensus established');
        this.actions.setConsensus('established');
    }

    _onConsensusLost() {
        console.log('Consensus lost');
        this.actions.setConsensus('lost');
    }

    _onBalanceChanged(balances) {
        this.actions.updateBalances(balances);
    }

    _onTransaction(tx) {
        this.actions.addTransactions([tx]);
    }

    _onTransactionExpired(hash) {
        this.actions.markRemoved([hash], this.store.getState().network.height + 1);
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