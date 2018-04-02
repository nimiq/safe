import XElement from '/libraries/x-element/x-element.js';
import XAccount from './x-account.js';
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js';
import XNoAccounts from './x-no-accounts.js';

export default class XAccountsList extends MixinRedux(XElement) {
    html() {
        return `
            <x-loading-animation></x-loading-animation>
            <h2>Loading accounts...</h2>
        `;
    }

    onCreate() {
        this._accountEntries = new Map();
        super.onCreate();
    }

    static mapStateToProps(state) {
        return {
            accounts: state.accounts.entries,
            hasContent: state.accounts.hasContent
        };
    }

    _onPropertiesChanged(changes) {
        const { hasContent, accounts } = this.properties;

        if (!hasContent) return;

        if (changes.accounts) {
            if (this.$('x-loading-animation') || this.$('x-no-accounts')) {
                this.$el.textContent = ''; // remove loading animation
            }

            for (const [ address, account ] of changes.accounts) {
                const $account = this._accountEntries.get(address);
                if (account === undefined) {
                    // todo test!
                    $account && $accout.destroy && $account.destroy();
                    this._accountEntries.delete(address);
                } else if (!$account) {
                    // new entry
                    this._addAccountEntry(account);
                }
            }
        }

        if (accounts.size === 0) {
            this.$el.textContent = '';
            const $noContent = XNoAccounts.createElement();
            this.$el.appendChild($noContent.$el);
        }
    }

    /**
     * @param {object} account
     */
    _addAccountEntry(account) {
        if (this.attributes.noVesting && account.type === 4) {
            // Do not display vesting accounts
            this._accountEntries.set(account.address, true);
            return;
        }
        const accountEntry = this._createAccountEntry(account);
        this._accountEntries.set(account.address, accountEntry);
        this.$el.appendChild(accountEntry.$el);
    }

    _createAccountEntry(account) {
        const $account = XAccount.createElement();
        $account.account = account;

        return $account;
    }
}
