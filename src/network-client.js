import {
    NetworkClient as NimiqNetworkClient,
} from '../node_modules/@nimiq/network-client/dist/NetworkClient.standalone.es.js';

class NetworkClient {
    static getInstance() {
        this._instance = this._instance || new NetworkClient();
        return this._instance;
    }

    constructor() {
        this._isLaunched = false;

        this.client = new Promise(res => {
            this.clientResolve = res;
        });
    }

    async launch() {
        if (this._isLaunched) return;
        this._isLaunched = true;

        const client = new NimiqNetworkClient();
        await client.init();

        this.clientResolve(client);
    }
}

export default NetworkClient.getInstance();
