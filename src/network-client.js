import { RPC, EventClient } from '/libraries/boruca-messaging/src/boruca.js';
import config from './config.js';

class NetworkClient {
    static async getInstances() {
        this._instance = this._instance || new Promise(async resolve => {
            const networkClient = new NetworkClient();

            const [ eventClient, rpcClient ] = await Promise.all([
                networkClient.eventClient,
                networkClient.rpcClient
            ]);

            resolve({
                eventClient,
                rpcClient
            });
        });

        return this._instance;
    }

    constructor() {
        this.$iframe = this._createIframe(config.networkSrc);
        this.networkOrigin = new URL(config.networkSrc).origin;

        this.rpcClient = new Promise(res => {
            this.rpcClientResolve = res;
        });

        this.eventClient = new Promise(res => {
            this.eventClientResolve = res;
        });

        this.launch();
    }

    async launch() {
        this.rpcClientResolve(RPC.Client((await this.$iframe).contentWindow, 'NanoNetworkApi', this.networkOrigin));
        this.eventClientResolve(EventClient.create((await this.$iframe).contentWindow));
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

export default NetworkClient.getInstances();
