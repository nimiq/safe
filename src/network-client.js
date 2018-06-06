import { RPC, EventClient } from '/libraries/boruca-messaging/src/boruca.js';
import Config from '/libraries/secure-utils/config/config.js';

class NetworkClient {
    static getInstance() {
        this._instance = this._instance || new NetworkClient();
        return this._instance;
    }

    constructor() {
        this._isLaunched = false;

        this.rpcClient = new Promise(res => {
            this.rpcClientResolve = res;
        });

        this.eventClient = new Promise(res => {
            this.eventClientResolve = res;
        });
    }

    async launch() {
        if (this._isLaunched) return;
        this._isLaunched = true;
        this.$iframe = await this._createIframe(Config.src('network'));
        this.rpcClientResolve(RPC.Client(this.$iframe.contentWindow, 'NanoNetworkApi', Config.origin('network')));
        this.eventClientResolve(EventClient.create(this.$iframe.contentWindow));
    }

    /**
     * @return {Promise}
     */
    _createIframe(src) {
        const $iframe = document.createElement('iframe');
        const promise = new Promise(resolve => $iframe.addEventListener('load', () => resolve($iframe)));
        $iframe.src = src;
        $iframe.name = 'network';
        document.body.appendChild($iframe);
        return promise;
    }
}

export default NetworkClient.getInstance();
