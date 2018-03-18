import XElement from '/libraries/x-element/x-element.js';
import XAccount from './x-account.js';
import reduxify from '/libraries/redux/src/redux-x-element.js';
import store from '/apps/safe/store/store.js';

export default class XAccounts extends XElement {
    html() {
        return `
            <button create class="small">&plus; Create</button>
            <button import class="small">&#8615; Import</button>
            <x-accounts-list></x-accounts-list>
        `
    }

    onCreate() {
        this._accounts = new Map();
        this.$accountsList = this.$('x-accounts-list');
        this.$('button[create]').addEventListener('click', e => this._onCreateAccount());
        this.$('button[import]').addEventListener('click', e => this._onImportAccount());
    }

    _onPropertiesChanged() {
        const { accounts } = this.properties;

        for (const account of accounts.values()) {
            const stored = this._accounts.get(account.address);

            if (!stored) {
                this._accounts.set(account.address, [account, this._createAccount(account)]);
                continue;
            }
        }

        // Remove unpassed accounts
        const storedAddresses = [...this._accounts.keys()];
        const passedAddresses = [...accounts.keys()];

        const removedAddresses = storedAddresses.filter(address => !passedAddresses.includes(address));

        removedAddresses.forEach(address => {
            const [storedAccount, accountElement] = this._accounts.get(address);
            accountElement.$el.parentNode.removeChild(accountElement.$el);
            this._accounts.delete(address);
        });
    }

    /**
     * @param {object} account
     */
    addAccount(account) {
        this._accounts.set(account.address, [account, this._createAccount(account)]);
        // this.accounts = [...Array.from(this._accounts.values()).map(i => i[0]), account];
    }

    _createAccount(account) {
        const $account = reduxify(
            store,
            state => {
                const entry = state.accounts.entries.get(account.address);
                return {
                    balance: entry.balance,
                    label: entry.label
                };
            }
        )(XAccount).createElement();

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
}
