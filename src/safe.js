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
import XSafeLock from './elements/x-safe-lock.js';

class Safe {
    constructor() {
        this._networkLaunched = false;
        this._consensusSyncing = false;
        this._consensusEstablished = false;

        if (localStorage.getItem('lock')) {
            const $safeLock = XSafeLock.createElement();
            $safeLock.$el.classList.add('nimiq-dark');
            document.getElementById('app').appendChild($safeLock.$el);
        } else {
            this.launchApp();
        }

        // FIXME
        setTimeout(() => document.body.classList.remove('preparing'));
    }

    launchApp() {
        const $appContainer = document.getElementById('app');

        // set redux store
        this.store = store;
        MixinRedux.store = this.store;

        // set singleton app container
        MixinSingleton.appContainer = $appContainer;

        // Launch account manager
        accountManager.launch();

        // start UI
        this._xApp = new XSafe($appContainer);

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
            XToast.show(error.message || error, 'error');
        };

        // cancel request and close window when there is an unhandled promise rejection
        self.onunhandledrejection = (event) => {
            XToast.show(event.reason, 'error');
        };
    }

    async launchNetwork() {
        if (Config.offline) return;

        // Launch network
        networkClient.launch();
        if (location.origin === 'https://safe.nimiq.com' && !this._networkLaunched) {
            this._networkLaunched = true;
            _paq && _paq.push(['trackEvent', 'Network', 'Consensus', 'initialize', Math.round(performance.now() / 100) / 10]);
        }

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
        this.networkListener.on('nimiq-transaction-relayed', this._onTransactionRelayed.bind(this));
        this.networkListener.on('nimiq-peer-count', this._onPeerCountChanged.bind(this));
        this.networkListener.on('nimiq-head-change', this._onHeadChange.bind(this));
    }

    // todo refactor: move following methods to new class NetworkHandler(?)

    _onConsensusSyncing() {
        console.log('Consensus syncing');
        this.actions.setConsensus('syncing');
        if (location.origin === 'https://safe.nimiq.com' && !this._consensusSyncing) {
            this._consensusSyncing = true;
            _paq && _paq.push(['trackEvent', 'Network', 'Consensus', 'start-syncing', Math.round(performance.now() / 100) / 10]);
        }
    }

    _onConsensusEstablished() {
        console.log('Consensus established');
        this.actions.setConsensus('established');
        if (location.origin === 'https://safe.nimiq.com' && !this._consensusEstablished) {
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
        const accounts = this.store.getState().accounts.entries;
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
