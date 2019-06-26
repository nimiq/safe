import XElement from '../../lib/x-element/x-element.js';
import XExpandable from '../x-expandable/x-expandable.js';
import XAccount from './x-account.js';
import XAccountsList from './x-accounts-list.js';
import MixinRedux from '../mixin-redux';
import AccountType from '../../lib/account-type.js';
import { activeAccounts$ } from '../../selectors/account$.js';

export default class XAccountsDropdown extends MixinRedux(XElement) {
    protected static mapStateToProps(state: any) {
        return {
            accounts: activeAccounts$(state),
            hasContent: state.wallets.hasContent,
            loading: state.wallets.loading,
        };
    }

    private $account!: any;
    private $accountsList!: any;
    private $expandable!: any;
    private $input!: HTMLInputElement;
    private $statusMessage!: HTMLElement;
    private _isDisabled: boolean = false;

    public get selectedAccount() {
        const account = this.$account.account;
        // An XAccount.account always has the height property,
        // thus we check if there are any more than that one
        // todo remove height from account objects and find a less hacky solution
        return Object.keys(account).length > 1 ? account : null;
    }

    public set selectedAccount(account) {
        if (typeof(account) === 'string') {
            // user friendly address
            account = this.properties.accounts.get(account);
        }
        if (!account) return;
        this.$account.account = account;
        this.$input.value = account.address;
        this.fire('x-account-selected', account.address);
        // hide selected account
        this.$accountsList.selectedAccount = account.address;
    }

    public selectDefaultAccount() {
        if (!this.properties.accounts) return;
        // pre select some arbitrary account
        const accounts = this.properties.accounts.values();
        let account;
        // Dont auto-select contracts
        do {
            account = accounts.next().value;
        } while (account.type === AccountType.VESTING || account.type === AccountType.HTLC);
        this.selectedAccount = account;
    }

    public disable() {
        this._isDisabled = true;
        this.$expandable.disable();
    }

    public enable() {
        this._isDisabled = false;
        this.$expandable.enable();
    }

    protected html() {
        return `
            <x-expandable dropdown disabled>
                <div expandable-trigger>
                    <h3 status-message></h3>
                    <x-account></x-account>
                </div>
                <div expandable-content>
                    <x-accounts-list></x-accounts-list>
                </div>
            </x-expandable>
            <input type="hidden">
        `;
    }

    protected children() {
        return [ XExpandable, XAccount, XAccountsList ];
    }

    protected onCreate() {
        this.$statusMessage = this.$('[status-message]')!;
        this.$input = this.$('input') as HTMLInputElement;
        if (this.attributes.name) {
            this.$input.setAttribute('name', this.attributes.name);
        }
        this.$account.addEventListener('x-account-selected', (e: Event) => e.stopPropagation());
        super.onCreate();
    }

    protected _onPropertiesChanged(changes: { loading: boolean, hasContent: boolean, accounts: Map<string, any> }) {
        if (changes.loading === true || changes.hasContent === false
            || this.properties.accounts.size === 0) {
            this._showStatusMessage();
        }

        if (this.properties.accounts.size <= 1) {
            this.disable();
        } else {
            this.enable();
        }

        if (changes.accounts) {
            this.selectDefaultAccount();
        }
    }

    protected listeners() {
        return {
            'x-account-selected x-accounts-list': this._onAccountSelected,
        };
    }

    private _showStatusMessage() {
        if (this.properties.accounts.size === 0) {
            this.$statusMessage.textContent = '';
            const dots = document.createElement('span');
            dots.classList.add('dot-loader');
            this.$statusMessage.appendChild(dots);
        } else {
            this.$statusMessage.textContent = 'No accounts yet.';
        }
    }

    private _onAccountSelected(address: string) {
        const account = this.properties.accounts.get(address);
        this.$account.setProperties(account);
        this.$input.value = account.address;
        this.$expandable.collapse();
        // hide selected account
        this.$accountsList.selectedAccount = account.address;
    }
}
