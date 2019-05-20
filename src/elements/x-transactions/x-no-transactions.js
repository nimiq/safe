import XElement from '../../lib/x-element/x-element.js';
import Config from '../../lib/config.js';
import XFaucetModal from '../../elements/x-faucet-modal.js';

export default class XNoTransactions extends XElement {
    html() {
        return `
            <h1 class="material-icons">inbox</h1>
            <span>You have no transactions yet.</span>
            <br>
            <br><button class="nq-button green" faucet>Receive free NIM!</button>
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
