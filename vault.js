import Boruca from '/libraries/boruca-messaging/src/boruca.js';
import EventListener from '/libraries/boruca-messaging/src/event-listener.js';
import config from './config.js';

class Vault {
    constructor() {
        this.$keystore = document.querySelector('#keystore');
        this.$network = document.querySelector('#network');
        this.launch();
    }

    async launch() {
        const { proxy: keystoreProxy } = await Boruca.proxy(this.$keystore.contentWindow, config.keystoreOrigin);
        this._keystore = keystoreProxy;
        this._addresses = await this._keystore.getAddresses();

        console.log('Addresses:', this._addresses);

        this._networkListener = new EventListener();
        const { proxy: networkProxy } = await Boruca.proxy(this.$network.contentWindow, config.networkOrigin, this._networkListener.Receiver);
        this._network = networkProxy;

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

window.vault = new Vault();
