import { RPC, EventClient } from '/libraries/boruca-messaging/src/boruca.js';
import KeyguardClient from '/libraries/keyguard-client/keyguard-client.js';
import config from './config.js';

class Safe {
    constructor() {
        this.$network = document.querySelector('#network');
        this.launch();
    }

    async launch() {
        this._keyguard = await KeyguardClient.create(config.keyguardSrc);
        this._addresses = await this._keyguard.getAddresses();

        console.log('Addresses:', this._addresses);

        this._networkListener = await EventClient.create(this.$network.contentWindow);
        this._network = await RPC.Client(this.$network.contentWindow, 'NanoNetworkApi');

        this._networkListener.on('nimiq-api-ready', () => console.log('NanoNetworkApi ready'));
        this._networkListener.on('nimiq-consensus-established', this._onConsensusEstablished.bind(this));
        this._networkListener.on('nimiq-balance', this._onBalanceChanged.bind(this));
        this._networkListener.on('nimiq-different-tab-error', e => alert('Nimiq is already running in a different tab.'));
        this._networkListener.on('nimiq-api-fail', e => alert('Nimiq initialization error:', e.message || e));
    }

    _onConsensusEstablished() {
        console.log('Consensus established');
    }

    _onBalanceChanged(obj) {
        console.log('Balance changed:', obj.address, obj.balance);
    }

    getBalance(address) {
        return this._network.getBalance(address);
    }

    subscribeAddress(address) {
        return this._network.subscribeAddress(address);
    }

    subscribeAndGetBalance(address) {
        return this._network.subscribeAndGetBalance(address);
    }

    relayTransaction(obj) {
        return this._network.relayTransaction(obj);
    }
}

window.safe = new Safe();
