import { bindActionCreators } from 'redux';
import { updateBalances } from './redux/wallet-redux.js';
import { addTransactions, markRemoved } from './redux/transactions-redux.js';
import { setConsensus, setHeight, setPeerCount, setGlobalHashrate,  } from './redux/network-redux.js';
import networkClient from './network-client.js';

const TRACKING = location.origin === 'https://safe.nimiq.com';

export default class NetworkHandler {
    constructor(store) {
        this._store = store;
        this._actions = bindActionCreators({
            updateBalances,
            addTransactions,
            markRemoved,
            setConsensus,
            setHeight,
            setPeerCount,
            setGlobalHashrate
        }, store.dispatch);
    }

    async launch() {
        // Launch network
        networkClient.launch();
        if (TRACKING && !this._trackedNetworkLaunch) {
            this._trackedNetworkLaunch = true;
            _paq && _paq.push(['trackEvent', 'Network', 'Consensus', 'initialize', Math.round(performance.now() / 100) / 10]);
        }

        this.network = await networkClient.client;

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

    _onConsensusSyncing() {
        this._actions.setConsensus('syncing');
        if (TRACKING && !this._trackedConsensusSyncing) {
            this._trackedConsensusSyncing = true;
            _paq && _paq.push(['trackEvent', 'Network', 'Consensus', 'start-syncing', Math.round(performance.now() / 100) / 10]);
        }
    }

    _onConsensusEstablished() {
        this._actions.setConsensus('established');
        if (TRACKING && !this._trackedConsensusEstablished) {
            this._trackedConsensusEstablished = true;
            _paq && _paq.push(['trackEvent', 'Network', 'Consensus', 'established', Math.round(performance.now() / 100) / 10]);
        }
    }

    _onConsensusLost() {
        this._actions.setConsensus('lost');
    }

    _onBalanceChanged(balances) {
        this._actions.updateBalances(balances);
    }

    _onTransaction(tx) {
        // Check if we know the sender or recipient of the tx
        const accounts = this._store.getState().wallets.accounts;
        if (!accounts.has(tx.sender) && !accounts.has(tx.recipient)) {
            console.warn('Not displaying transaction because sender and recipient are unknown:', tx);
            return;
        }

        this._actions.addTransactions([tx]);
    }

    _onTransactionExpired(hash) {
        this._actions.markRemoved([hash], this._store.getState().network.height + 1);
    }

    _onTransactionRelayed(tx) {
        this._onTransaction(tx);

        const resolver = this.relayedTxResolvers.get(tx.hash);
        if (resolver) {
            resolver();
        }
    }

    _onHeadChange({height, globalHashrate}) {
        this._actions.setHeight(height);
        this._actions.setGlobalHashrate(globalHashrate);
    }

    _onPeerCountChanged(peerCount) {
        this._actions.setPeerCount(peerCount);
    }
}
