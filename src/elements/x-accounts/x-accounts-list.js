import XElement from '../../lib/x-element/x-element.js';
import XAccount from './x-account.js';
import MixinRedux from '../mixin-redux.js';
import { activeAccounts$ } from '../../selectors/account$.js';
import AccountType from '../../lib/account-type.js';

export default class XAccountsList extends MixinRedux(XElement) {
    html() {
        return `
            <x-loading-animation></x-loading-animation>
            <h2>Loading addresses...</h2>
        `;
    }

    onCreate() {
        this._accountEntries = new Map();
        super.onCreate();
    }

    static mapStateToProps(state) {
        return {
            accounts: activeAccounts$(state),
            hasContent: state.wallets.hasContent
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
                    $account && $account.destroy && $account.destroy();
                    this._accountEntries.delete(address);
                    if (this._selectedAccount === address) {
                        this._selectedAccount = null;
                    }
                } else if (!$account) {
                    // new entry
                    this._addAccountEntry(account);
                    // hide if selected
                    if (this._selectedAccount === address) {
                        this._accountEntries.get(address).$el.classList.add('display-none');
                    }
                }
            }
        }
    }

    set selectedAccount(address) {
        if (this._selectedAccount) {
            this._accountEntries.get(this._selectedAccount).$el.classList.remove('display-none');
        }
        this._accountEntries.get(address).$el.classList.add('display-none');
        this._selectedAccount = address;
    }

    /**
     * @param {object} account
     */
    _addAccountEntry(account) {
        if (this.attributes.noVesting && account.type === AccountType.VESTING) {
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
