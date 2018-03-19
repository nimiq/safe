import KeyguardClient from '/libraries/keyguard-client/keyguard-client.js';
import SafePolicy from '/libraries/keyguard/access-control/safe-policy.js';
import store from './store/store.js';
import config from './config.js';

class KeyguardSingleton {
    static async getInstance() {
        this._instance = this._instance ||
            await KeyguardClient.create(config.keyguardSrc, new SafePolicy(), () => store.getState());
        return this._instance;
    }
}

export default KeyguardSingleton.getInstance();
