import { bindActionCreators } from 'redux';
import { updateBalances } from './redux/wallet-redux.js';
import { addTransactions, markRemoved } from './redux/transactions-redux.js';
import { setConsensus, setHeight, setPeerCount, setGlobalHashrate } from './redux/network-redux.js';
import networkClient from './network-client.js';
import store from './store.js';

const TRACKING = location.origin === 'https://safe.nimiq.com';

export default class NetworkHandler {
    constructor() {
        this._actions = bindActionCreators({
            updateBalances,
            addTransactions,
            markRemoved,
            setConsensus,
            setHeight,
            setPeerCount,
            setGlobalHashrate
        }, store.dispatch);

        this._relayedTxResolvers = new Map();
    }

    async launch() {
        // Launch network
        networkClient.launch();
        if (TRACKING && !this._trackedNetworkLaunch) {
            this._trackedNetworkLaunch = true;
            _paq && _paq.push(['trackEvent', 'Network', 'Consensus', 'initialize', Math.round(performance.now() / 100) / 10]);
        }

        const network = await networkClient.client;

        // Subscribe to network events
        network.on('nimiq-api-ready', () => console.log('NanoNetworkApi ready'));
        network.on('nimiq-consensus-syncing', this._onConsensusSyncing.bind(this));
        network.on('nimiq-consensus-established', this._onConsensusEstablished.bind(this));
        network.on('nimiq-consensus-lost', this._onConsensusLost.bind(this));
        network.on('nimiq-balances', this._onBalanceChanged.bind(this));
        network.on('nimiq-different-tab-error', e => alert('Nimiq is already running in a different tab.'));
        network.on('nimiq-api-fail', e => alert('Nimiq initialization error:', e.message || e));
        network.on('nimiq-transaction-pending', this._onTransaction.bind(this));
        network.on('nimiq-transaction-expired', this._onTransactionExpired.bind(this));
        network.on('nimiq-transaction-mined', this._onTransaction.bind(this));
        network.on('nimiq-transaction-relayed', this._onTransactionRelayed.bind(this));
        network.on('nimiq-peer-count', this._onPeerCountChanged.bind(this));
        network.on('nimiq-head-change', this._onHeadChange.bind(this));
    }

    async sendTransaction(signedTx) {
        signedTx = Object.assign({}, signedTx); // create a copy to not manipulate the original
        const network = await networkClient.client;
        const relayedTx = new Promise((resolve, reject) => {
            this._relayedTxResolvers.set(signedTx.hash, resolve);
            setTimeout(reject, 8000, new Error('Transaction could not be sent'));
        });

        signedTx.value = signedTx.value / 1e5;
        signedTx.fee = signedTx.fee / 1e5;

        network.relayTransaction(signedTx);

        try {
            await relayedTx;
        } catch(e) {
            try { network.removeTxFromMempool(signedTx); } catch(e) {}
            throw e;
        } finally {
            this._relayedTxResolvers.delete(signedTx.hash);
        }
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
        const accounts = store.getState().wallets.accounts;
        if (!accounts.has(tx.sender) && !accounts.has(tx.recipient)) {
            console.warn('Not displaying transaction because sender and recipient are unknown:', tx);
            return;
        }

        this._actions.addTransactions([tx]);
    }

    _onTransactionExpired(hash) {
        this._actions.markRemoved([hash], store.getState().network.height + 1);
    }

    _onTransactionRelayed(tx) {
        this._onTransaction(tx);

        const resolver = this._relayedTxResolvers.get(tx.hash);
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
