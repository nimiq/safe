import XElement from '/libraries/x-element/x-element.js';
import XAccount from './x-account.js';
import XAccountsList from './x-accounts-list.js';
import MixinRedux from '/elements/mixin-redux/mixin-redux.js';

export default class XAccountsDropdown extends MixinRedux(XElement) {

    html() {
        return `
            <h3 status-message></h3>
            <x-account></x-account>
            <div dropdown-container>
                <x-accounts-list></x-accounts-list>
            </div>
            <input type="hidden">
        `;
    }

    children() {
        return [ XAccount, XAccountsList ];
    }

    onCreate() {
        this._open = false;
        this._closeTimeout = null;
        this.$statusMessage = this.$('[status-message]');
        this.$dropdownContainer = this.$('[dropdown-container]');
        this.$input = this.$('input');
        if (this.attributes.name) this.$input.setAttribute('name', this.attributes.name);
        this.$el.addEventListener('click', e => e.stopPropagation()); // to avoid body click
        this.$account.addEventListener('x-account-selected', e => e.stopPropagation());
        this._closeDropdown = this._closeDropdown.bind(this);
        super.onCreate();
    }

    static mapStateToProps(state) {
        return {
            accounts: state.accounts.entries,
            hasContent: state.accounts.hasContent,
            loading: state.accounts.loading
        };
    }

    _onPropertiesChanged(changes) {
        if (changes.loading === true || changes.hasContent === false) {
            this._showStatusMessage();
            return;
        }

        this.$el.classList.add('ready');

        if (changes.accounts && !this.selectedAccount) {
            // pre select some arbitrary account
            this.selectedAccount = changes.accounts.values().next().value;
        }
    }

    listeners() {
        return {
            'x-account-selected x-accounts-list': this._onAccountSelected,
            'click x-account': this._toggleDropdown
        };
    }

    get selectedAccount() {
        const account = this.$account.account;
        // An XAccount.account always has the hight property,
        // thus we check if there are any more than that one
        return Object.keys(account).length > 1 ? account : null;
    }

    set selectedAccount(account) {
        if (typeof(account) === 'string') {
            // user friendly address
            account = this.properties.accounts.get(account);
        }
        if (!account) return;
        this.$account.account = account;
        this.$input.value = account.address;
    }

    _showStatusMessage() {
        const { loading, hasContent } = this.properties;
        if (hasContent) return;
        this._closeDropdown();
        this.$el.classList.remove('ready');
        if (loading) {
            this.$statusMessage.textContent = '';
            const dots = document.createElement('span');
            dots.classList.add('dot-loader');
            this.$statusMessage.appendChild(dots);
        } else {
            this.$statusMessage.textContent = 'No accounts yet.';
        }
    }

    _onAccountSelected(address) {
        const account = this.properties.accounts.get(address);
        this.$account.setProperties(account);
        this.$input.value = account.address;
        this._closeDropdown();
    }

    _toggleDropdown() {
        if (this._open) {
            this._closeDropdown();
        } else {
            this._openDropdown();
        }
    }

    _openDropdown() {
        if (this._open || this.properties.loading || !this.properties.hasContent) return;
        this._open = true;
        clearTimeout(this._closeTimeout);
        document.body.addEventListener('click', this._closeDropdown);
        this.$dropdownContainer.style.display = 'block';
        this.$dropdownContainer.offsetWidth; // style update
        this.$dropdownContainer.style.maxHeight = '200px';
    }

    _closeDropdown() {
        if (!this._open) return;
        this._open = false;
        document.body.removeEventListener('click', this._closeDropdown);
        this.$dropdownContainer.style.maxHeight = '0';
        this._closeTimeout = setTimeout(() => {
            this.$dropdownContainer.style.display = 'none';
        }, XAccountsDropdown.ANIMATION_TIME);
    }
}
XAccountsDropdown.ANIMATION_TIME = 500;
