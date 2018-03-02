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
        this._networkListener.on('consensus-established', this._onConsensusEstablished.bind(this));
        this._networkListener.on('balance-changed', this._onBalanceChanged.bind(this));
    }

    _onConsensusEstablished() {
        console.log('Consensus established');
    }

    _onBalanceChanged(newBalance) {
        console.log('New balance:', newBalance);
    }
}

new Vault();
