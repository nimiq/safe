import Boruca from '/libraries/boruca-messaging/src/boruca.js';
import config from './config.js';

class Vault {
    constructor() {
        this.$keystore = document.querySelector('#keystore');
        this.launch();
    }

    async launch() {
        const { proxy } = await Boruca.proxy(this.$keystore.contentWindow, config.keystoreOrigin);
        this._keystore = proxy;
        this._addresses = await this._keystore.getAddresses();

        console.log(this._addresses);
    }
}

new Vault();
