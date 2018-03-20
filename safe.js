import XSafe from './elements/x-safe.js';
import { bindActionCreators } from '/libraries/redux/src/index.js';
import store from './store/store.js';
import { updateBalance, setAllKeys } from './store/accounts.js';
import { addTransactions } from './store/transactions.js';
import keyguardPromise from './keyguard.js';
import networkClient from './network-client.js';

class Safe {
    constructor() {
        const $appContainer = document.querySelector('#app');

        // start UI
        this._xApp = new XSafe($appContainer);

        this.actions = bindActionCreators({ setAllKeys, updateBalance, addTransactions }, store.dispatch);

        this.launch();
    }

    async launch() {
        await Promise.all([
            new Promise(async (res, err) => {
                // launch keyguard client
                this.keyguard = await keyguardPromise;
                const keys = await this.keyguard.list();
                // initialize accounts with keyguard data and load balances
                await this.actions.setAllKeys(keys);
                res();
            }),
            new Promise(async (res, err) => {
                // launch network rpc client
                this.network = (await networkClient).rpcClient;
                res();
            }),
            new Promise(async (res, err) => {
                // launch network event client
                this.networkListener = (await networkClient).eventClient;
                this.networkListener.on('nimiq-api-ready', () => console.log('NanoNetworkApi ready'));
                this.networkListener.on('nimiq-consensus-syncing', this._onConsensusSyncing.bind(this));
                this.networkListener.on('nimiq-consensus-established', this._onConsensusEstablished.bind(this));
                this.networkListener.on('nimiq-consensus-lost', this._onConsensusLost.bind(this));
                this.networkListener.on('nimiq-balance', this._onBalanceChanged.bind(this));
                this.networkListener.on('nimiq-different-tab-error', e => alert('Nimiq is already running in a different tab.'));
                this.networkListener.on('nimiq-api-fail', e => alert('Nimiq initialization error:', e.message || e));
                this.networkListener.on('nimiq-transaction-pending', this._onTransaction.bind(this));
                this.networkListener.on('nimiq-transaction-mined', this._onTransaction.bind(this));
                res();
            })
        ]);

        // Request transaction history
        const accounts = store.getState().accounts.entries;
        const addresses = [...accounts.values()].map(account => account.address);
        const txs = await this.network.requestTransactionHistory(addresses);
        for (const tx of txs) {
            tx.senderLabel = accounts.get(tx.sender) ? accounts.get(tx.sender).label : tx.sender.slice(0, 9) + '...';
            tx.recipientLabel = accounts.get(tx.recipient) ? accounts.get(tx.recipient).label : tx.recipient.slice(0, 9) + '...';
        }
        this.actions.addTransactions(txs);
    }

    _onConsensusSyncing() {
        console.log('Consensus syncing');
    }

    _onConsensusEstablished() {
        console.log('Consensus established');
    }

    _onConsensusLost() {
        console.log('Consensus lost');
    }

    _onBalanceChanged(obj) {
        this.actions.updateBalance(obj.address, obj.balance);
    }

    _onTransaction(tx) {
        const accounts = store.getState().accounts.entries;
        tx.senderLabel = accounts.get(tx.sender) ? accounts.get(tx.sender).label : tx.sender.slice(0, 9) + '...';
        tx.recipientLabel = accounts.get(tx.recipient) ? accounts.get(tx.recipient).label : tx.recipient.slice(0, 9) + '...';
        this.actions.addTransactions([tx]);
    }

    /** @param {string|string[]} address */
    subscribe(address) {
        return this.network.subscribe(address);
    }

    relayTransaction(obj) {
        return this.network.relayTransaction(obj);
    }
}

window.safe = new Safe();

// todo persist parts of state on unload
