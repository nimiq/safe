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
                this.networkListener.on('nimiq-consensus-established', this._onConsensusEstablished.bind(this));
                this.networkListener.on('nimiq-balance', this._onBalanceChanged.bind(this));
                this.networkListener.on('nimiq-different-tab-error', e => alert('Nimiq is already running in a different tab.'));
                this.networkListener.on('nimiq-api-fail', e => alert('Nimiq initialization error:', e.message || e));
                this.networkListener.on('nimiq-transaction-pending', this._onTransactionPending.bind(this));
                this.networkListener.on('nimiq-transaction-mined', this._onTransactionMined.bind(this));
                res();
            })
        ]);

        console.log("requesting tx history");

        // Request transaction history
        const addresses = [...store.getState().accounts.entries.values()].map(account => account.address);
        const txs = await this.network.requestTransactionHistory(addresses);
        this.actions.addTransactions(txs);
    }

    _onConsensusEstablished() {
        console.log('Consensus established');
    }

    _onBalanceChanged(obj) {
        this.actions.updateBalance(obj.address, obj.balance);
    }

    _onTransactionPending(tx) {
        this.actions.addPendingTransaction(tx);
    }

    _onTransactionMined(tx) {
        //
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
