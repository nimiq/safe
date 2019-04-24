import { NetworkClient as NimiqNetworkClient } from '../node_modules/@nimiq/network-client/dist/NetworkClient.standalone.es.js';

class NetworkClient {
    static getInstance() {
        this._instance = this._instance || new NetworkClient();
        return this._instance;
    }

    /**
     * @param {string} [endpoint]
     */
    constructor(endpoint) {
        this._isLaunched = false;

        this._endpoint = endpoint;

        this.client = new Promise(res => {
            this.clientResolve = res;
        });
    }

    async launch() {
        if (this._isLaunched) return;
        this._isLaunched = true;

        const client = new NimiqNetworkClient(this._endpoint);
        await client.init();

        this.clientResolve(client);
    }
}

export default NetworkClient.getInstance();
