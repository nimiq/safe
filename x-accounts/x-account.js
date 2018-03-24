import XElement from '/libraries/x-element/x-element.js';
import MixinRedux from '/elements/mixin-redux/mixin-redux.js';
import XAmount from '/elements/x-amount/x-amount.js';
import XIdenticon from '../x-identicon/x-identicon.js';
import XAddress from '../x-address/x-address.js';
import NanoApi from '/libraries/nano-api/nano-api.js';

export default class XAccount extends MixinRedux(XElement) {
    html() {
        return `
            <x-identicon></x-identicon>
            <div class="x-account-info">
                <span class="x-account-label"></span>
                <x-address></x-address>
                <div class="x-account-bottom">
                    <i class="hidden secure-icon" title="High security account"></i>
                    <i class="hidden vesting-icon" title="Vesting contract"></i>
                    <x-amount></x-amount>
                </div>
            </div>
        `
    }

    children() { return [XIdenticon, XAddress, XAmount] }

    onCreate() {
        super.onCreate();
        this.$label = this.$('.x-account-label');
        this.$secureIcon = this.$('.secure-icon');
        this.$vestingIcon = this.$('.vesting-icon');
    }

    listeners() {
        return {
            'click': this._onAccountSelected
        }
    }

    static mapStateToProps(state, props) {
        return {
            ...state.accounts.entries.get(props.address)
        }
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
        this._address = address;
    }

    set balance(balance) {
        this.$amount.value = balance;
    }

    set type(type) {
        this.$secureIcon.classList.add('hidden');
        this.$vestingIcon.classList.add('hidden');

        switch (type) {
            case 1: this.$secureIcon.classList.remove('hidden'); break; // KEYGUARD_HIGH
            case 2: break; // KEYGUARD_LOW
            case 3: break; // LEDGER
            case 4: this.$vestingIcon.classList.remove('hidden'); break; // VESTING
        }
    }

    set account(account) {
        this.setProperties(account, true);
    }

    get account() {
        return this.properties;
    }

    _onAccountSelected() {
        this.fire('x-account-selected', this.account);
    }
}
