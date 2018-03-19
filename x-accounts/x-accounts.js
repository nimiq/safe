import XElement from '/libraries/x-element/x-element.js';
import { XAccount, XAccountModal } from './x-account.js';

export default class XAccounts extends XElement {
    html() {
        return `
            <button create class="small">&plus; Create</button>
            <button import class="small">&#8615; Import</button>
            <x-accounts-list>
                <x-loading-animation></x-loading-animation>
                <h2>Loading accounts...</h2>
            </x-accounts-list>
        `
    }

    onCreate() {
        this._accounts = new Map();
        this.$accountsList = this.$('x-accounts-list');
    }

    listeners() {
        return {
            'click button[create]': this._onCreateAccount,
            'click button[import]': this._onImportAccount,
            'x-account-selected': this._onAccountSelected
        }
    }

    _onPropertiesChanged(changes) {
        if (changes.accounts) {
            if (this.$('x-loading-animation')) {
                this.$accountsList.textContent = '';
            }

            for (const [ address, account ] of changes.accounts) {
                const $account = this._accounts.get(address);
                if (account === undefined) {
                    // todo test!
                    $account && $account.destroy();
                    this._accounts.delete(address);
                } else {
                    if ($account) $account.setProperties(account);
                    else this.addAccount(account);
                }
            }
        }
    }

    /**
     * @param {object} account
     */
    addAccount(account) {
        this._accounts.set(account.address, this._createAccount(account));
    }

    _createAccount(account) {
        const $account = XAccount.createElement();

        $account.setProperties({
            ...account
        });

        this.$accountsList.appendChild($account.$el);

        return $account;
    }

    _onCreateAccount() {
        this.fire('x-accounts-create');
    }

    _onImportAccount() {
        this.fire('x-accounts-import');
    }

    _onAccountSelected(address) {
        XAccountModal.instance.setProperties(this._accounts.get(address).properties);
        XAccountModal.show();
    }
}
