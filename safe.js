import { RPC, EventClient } from '/libraries/boruca-messaging/src/boruca.js';
import config from './config.js';
import XSafe from './elements/x-safe.js';
import { bindActionCreators } from '/libraries/redux/src/index.js';
import store from './store/store.js';
import { setAll } from './store/accounts.js';
import keyguardPromise from './keyguard.js';

class Safe {
    constructor() {
        this.$network = document.querySelector('#network');
        this.$network.src = config.networkSrc;
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
<<<<<<< HEAD
                this._keys = await this.keyguard.list();
                console.log('Keys:', this._keys);
                this._xApp.$accounts.accounts = this._keys;
=======
                const keys = await this.keyguard.list();
                this.actions.setAll(keys);
                console.log('Keys:', keys);
>>>>>>> some account store design and use
                res();
            }),
            new Promise(async (res, err) => {
                // launch network rpc client
                this.network = await RPC.Client(this.$network.contentWindow, 'NanoNetworkApi');
                res();
            }),
            new Promise(async (res, err) => {
                // launch network event client
                this.networkListener = await EventClient.create(this.$network.contentWindow);
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
        console.log('Balance changed:', obj.address, obj.balance);
    }

    getBalance(address) {
        return this.network.getBalance(address);
    }

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
