import XSafe from './elements/x-safe.js';
import { bindActionCreators } from '/libraries/redux/src/index.js';
import store from './store/store.js';
import { setAll } from './store/accounts.js';
import keyguardPromise from './keyguard.js';
import networkClient from './network-client.js';

class Safe {
    constructor() {
        const $appContainer = document.querySelector('#app');

        // start UI
        this._xApp = new XSafe($appContainer);

        this.actions = bindActionCreators({ setAll }, store.dispatch);

        this.launch();
    }

    async launch() {
        return Promise.all([
            new Promise(async (res, err) => {
                // launch keyguard client
                this.keyguard = await keyguardPromise;
                const keys = await this.keyguard.list();
                this.actions.setAll(keys);
                this.actions.getAllBalances();
                console.log('Keys:', keys);
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
                res();
            })
        ]);
    }

    _onConsensusEstablished() {
        console.log('Consensus established');
    }

    _onBalanceChanged(obj) {
        this.actions.updateBalance(obj.address, obj.balance);
    }

    getBalance(address) {
        return this.network.getBalance(address);
    }

    // todo: instant balanceChanged event for new subscribers
    subscribeAddress(address) {
        return this.network.subscribeAddress(address);
    }

    subscribeAndGetBalance(address) {
        return this.network.subscribeAndGetBalance(address);
    }

    relayTransaction(obj) {
        return this.network.relayTransaction(obj);
    }
}

window.safe = new Safe();

// todo dispatch redux actions for incoming network events
