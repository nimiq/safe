import { RPC, EventClient } from '/libraries/boruca-messaging/src/boruca.js';
import KeyguardClient from '/libraries/keyguard-client/keyguard-client.js';
import config from './config.js';

class Safe {
    constructor() {
        this.$network = document.querySelector('#network');
        this.launch();
    }

    async launch() {
        return Promise.all([
            new Promise(async (res, err) => {
                this.keyguard = await KeyguardClient.create(config.keyguardSrc);
                this._accounts = await this.keyguard.getAccounts();
                console.log('Addresses:', this._accounts);
                res();
            }),
            new Promise(async (res, err) => {
                this.network = await RPC.Client(this.$network.contentWindow, 'NanoNetworkApi);
                res();
            }),
            new Promise(async (res, err) => {
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
