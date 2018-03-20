import XElement from '/libraries/x-element/x-element.js';
import XAccount from './x-account.js';

export default class XAccountsList extends XElement {
    html() {
        return `
            <x-loading-animation></x-loading-animation>
            <h2>Loading accounts...</h2>
        `;
    }

    onCreate() {
        this._accountEntries = new Map();
    }

    _onPropertiesChanged(changes) {
        if (!changes.accounts) return;

        for (const [ address, account ] of changes.accounts) {
            const $account = this._accountEntries.get(address);
            if (account === undefined) {
                // todo test!
                $account && $account.destroy();
                this._accountEntries.delete(address);
            } else {
                if ($account) $account.setProperties(account);
                else this._addAccountEntry(account);
            }
        }
    }

    /**
     * @param {object} account
     */
    _addAccountEntry(account) {
        const accountEntry = this._createAccountEntry(account);
        this._accountEntries.set(account.address, accountEntry);
        if (this.$('x-loading-animation')) {
            this.$el.textContent = ''; // remove loading animation
        }
        this.$el.appendChild(accountEntry.$el);
    }

    _createAccountEntry(account) {
        const $account = XAccount.createElement();

        $account.setProperties({
            ...account
        });

        return $account;
    }
}
