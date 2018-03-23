import XSafe from './elements/x-safe.js';
import { bindActionCreators } from '/libraries/redux/src/index.js';
import MixinRedux from '/elements/mixin-redux/mixin-redux.js';
import configureStore from './store/configure-store.js';
import { updateBalances, setAllKeys } from '/elements/x-accounts/accounts-redux.js';
import { addTransactions } from '/elements/x-transactions/transactions-redux.js';
import { setConsensus, setHeight, setPeerCount } from '/elements/x-network-indicator/x-network-indicator-redux.js';
import keyguardPromise from './keyguard.js';
import networkClient from './network-client.js';
import MixinSingleton from '/elements/mixin-singleton/mixin-singleton.js';

class Safe {
    constructor() {
        const $appContainer = document.querySelector('#app');

        // set redux store
        this.store = configureStore();
        MixinRedux.store = this.store;

        // set singleton app container
        MixinSingleton.appContainer = $appContainer;

        // start UI
        this._xApp = new XSafe($appContainer);

        this.actions = bindActionCreators({
            setAllKeys,
            updateBalances,
            addTransactions,
            setConsensus,
            setHeight,
            setPeerCount
        }, this.store.dispatch);

        this.launch();
    }

    async launch() {
        await Promise.all([
            new Promise(async (res, err) => {
                // launch keyguard client
                this.keyguard = await keyguardPromise;
                window.keyguard = this.keyguard; // for debugging
                const keys = await this.keyguard.list();
                // initialize accounts with keyguard data and load balances
                await this.actions.setAllKeys(keys);
                res();
            }),
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

        // Request transaction history
        const accounts = this.store.getState().accounts.entries;
        const addresses = [...accounts.values()].map(account => account.address);
        const txs = await this.network.requestTransactionHistory(addresses);
        this.actions.addTransactions(txs);
    }

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

    _onHeadChange(height) {
        this.actions.setHeight(height);
    }

    _onPeerCountChanged(peerCount) {
        this.actions.setPeerCount(peerCount);
    }

    relayTransaction(obj) {
        return this.network.relayTransaction(obj);
    }
}

window.safe = new Safe();

// todo persist parts of state on unload
