import XElement from '/libraries/x-element/x-element.js';
import Config from '/libraries/secure-utils/config/config.js';

export default class XNoTransactions extends XElement {
    html() {
        return `
            <h1 class="material-icons">inbox</h1>
            <span>You have no transactions yet</span>
        `
    }

    onCreate() {
        if (Config.offline) {
            this.$('h1').textContent = 'cloud_off';
            this.$('span').textContent = 'Transactions are not available in offline mode';
        }
    }
}
