import XElement from '/libraries/x-element/x-element.js';
import Config from '/libraries/secure-utils/config/config.js';
import XFaucetModal from '/apps/safe/src/elements/x-faucet-modal.js';

export default class XNoTransactions extends XElement {
    html() {
        return `
            <h1 class="material-icons">inbox</h1>
            <span>You have no transactions yet.</span>
            <br>
            <br><button class="small green" faucet>Get your first NIM!</button>
        `
    }

    onCreate() {
        if (Config.offline) {
            this.$('h1').textContent = 'cloud_off';
            this.$('span').textContent = 'Transactions are not available in offline mode';
        }

        const $faucetButton = this.$('[faucet]');
        $faucetButton.addEventListener('click', () => {
            XFaucetModal.show();
            $faucetButton.disabled = true;
        });
    }
}
