import { RPC, EventClient } from '/libraries/boruca-messaging/src/boruca.js';
import config from './config.js';

class NetworkClient {
    static async getInstances() {
        this._instance = this._instance || new NetworkClient();

        const [ eventClient, rpcClient ] = await Promise.all([this._instance.eventClient, this._instance.rpcClient]);

        return {
            eventClient,
            rpcClient
        }
    }

    constructor() {
        const $iframe = this._createIframe(config.networkSrc);
        const networkOrigin = new URL(config.networkSrc).origin;

        this.rpcClient = RPC.Client($iframe.contentWindow, 'NanoNetworkApi', networkOrigin);
        this.eventClient = EventClient.create($iframe.contentWindow);
    }

    _createIframe(src) {
        const $iframe = document.createElement('iframe');
        $iframe.src = src;
        $iframe.name = 'network';
        document.body.appendChild($iframe);
        return $iframe;
    }
}

export default NetworkClient.getInstances();
