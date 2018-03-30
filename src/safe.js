import XSafe from './elements/x-safe.js';
import { bindActionCreators } from '/libraries/redux/src/index.js';
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js';
import { default as store, Store } from './store.js';
import { updateBalances, setAllKeys } from '/elements/x-accounts/accounts-redux.js';
import { addTransactions } from '/elements/x-transactions/transactions-redux.js';
import { setConsensus, setHeight,
    setPeerCount, setGlobalHashrate } from '/elements/x-network-indicator/network-redux.js';
import accountManager from '/libraries/account-manager/account-manager.js';
import networkClient from './network-client.js';
import MixinSingleton from '/secure-elements/mixin-singleton/mixin-singleton.js';

class Safe {
    constructor() {
        const $appContainer = document.querySelector('#app');

        // set redux store
        this.store = store;
        MixinRedux.store = this.store;

        // set singleton app container
        MixinSingleton.appContainer = $appContainer;

        // Launch account manager
        accountManager.then(a => {
            this.accountManager = a;
        });

        // start UI
        this._xApp = new XSafe($appContainer);

        // FIXME
        setTimeout(() => document.body.classList.remove('preparing'));

        this.actions = bindActionCreators({
            setAllKeys,
            updateBalances,
            addTransactions,
            setConsensus,
            setHeight,
            setPeerCount,
            setGlobalHashrate
        }, this.store.dispatch);

        this.launch();

        // Persist store before closing
        self.onunload = () => {
            if (!window.skipPersistingState) Store.persist();
        }
    }

    async launch() {
        await Promise.all([
            new Promise(async (res, err) => {
                // launch network rpc client
                this.network = (await networkClient).rpcClient;
                window.network = this.network; // for debugging
                res();
            }),
            new Promise(async (res, err) => {
                // launch network event client
                this.networkListener = (await networkClient).eventClient;
                this.networkListener.on('nimiq-api-ready', () => console.log('NanoNetworkApi ready'));
                this.networkListener.on('nimiq-consensus-syncing', this._onConsensusSyncing.bind(this));
                this.networkListener.on('nimiq-consensus-established', this._onConsensusEstablished.bind(this));
                this.networkListener.on('nimiq-consensus-lost', this._onConsensusLost.bind(this));
                this.networkListener.on('nimiq-balances', this._onBalanceChanged.bind(this));
                this.networkListener.on('nimiq-different-tab-error', e => alert('Nimiq is already running in a different tab.'));
                this.networkListener.on('nimiq-api-fail', e => alert('Nimiq initialization error:', e.message || e));
                this.networkListener.on('nimiq-transaction-pending', this._onTransaction.bind(this));
                this.networkListener.on('nimiq-transaction-mined', this._onTransaction.bind(this));
                this.networkListener.on('nimiq-peer-count', this._onPeerCountChanged.bind(this));
                this.networkListener.on('nimiq-head-change', this._onHeadChange.bind(this));
                res();
            })
        ]);
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

    _onHeadChange({height, globalHashrate}) {
        this.actions.setHeight(height);
        this.actions.setGlobalHashrate(globalHashrate);
    }

    _onPeerCountChanged(peerCount) {
        this.actions.setPeerCount(peerCount);
    }

    relayTransaction(obj) {
        return this.network.relayTransaction(obj);
    }
}

window.safe = new Safe();
