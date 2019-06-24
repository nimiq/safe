import XElement from '../../lib/x-element/x-element.js';
import MixinRedux from '../mixin-redux.js';
import XAmount from '../x-amount/x-amount.js';
import XIdenticon from '../x-identicon/x-identicon.js';
import XAddress from '../x-address/x-address';
import { accounts$ } from '../../selectors/account$.js';

export default class XAccount extends MixinRedux(XElement) {
    html() {
        return `
            <x-identicon class="x-identicon"></x-identicon>
            <i class="account-icon material-icons"></i>
            <div class="x-account-info">
                <span class="x-account-label"></span>
                <x-address class="x-address"></x-address>
                <div class="x-account-bottom">
                    <x-amount class="x-amount"></x-amount>
                </div>
            </div>
        `
    }

    children() { return [XIdenticon, XAddress, XAmount] }

    onCreate() {
        this.$label = this.$('.x-account-label');
        this.$icon = this.$('.account-icon');
        this.$el.classList.add('x-account');
        this.$balance = this.$amount[0] || this.$amount;
        super.onCreate();
    }

    listeners() {
        return {
            'click': this._onAccountSelected
        }
    }

    static mapStateToProps(state, props) {
        return accounts$(state).get(props.address);
    }

    _onPropertiesChanged(changes) {
        for (const prop in changes) {
            if (changes[prop] !== undefined) {
                // Update display
                this[prop] = changes[prop];
            }
        }
    }

    set label(label) {
        this.$label.textContent = label;
    }

    set address(address) {
        this.$identicon.address = address;
        this.$address.address = address;
    }

    set balance(balance) {
        this.$balance.value = balance;
    }

    set type(type) {
        this.$icon.classList.remove('ledger-icon', 'vesting-icon');

        switch (type) {
            case 3: // LEDGER
                this.$icon.classList.add('ledger-icon');
                this.$icon.classList.remove('display-none');
                this.$icon.setAttribute('title', 'Ledger account');
                break;
            case 4: // VESTING
                this.$icon.classList.add('vesting-icon');
                this.$icon.classList.remove('display-none');
                this.$icon.setAttribute('title', 'Vesting contract');
                break;
            default: // KEYGUARD
                this.$icon.classList.add('display-none');
                this.$icon.setAttribute('title', '');
                break;
        }
    }

    set account(account) {
        this.setProperties(account, true);
    }

    get account() {
        return this.properties;
    }

    _onAccountSelected() {
        this.fire('x-account-selected', this.account.address);
    }
}
