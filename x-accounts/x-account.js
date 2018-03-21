import XElement from '/libraries/x-element/x-element.js';
import MixinRedux from '/elements/mixin-redux/mixin-redux.js';
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
                    <span class="x-account-balance">
                        <span class="dot-loader"></span>
                    </span>
                </div>
            </div>
        `
    }

    children() { return [XIdenticon, XAddress] }

    onCreate() {
        super.onCreate();
        this.$label = this.$('.x-account-label');
        this.$balance = this.$('.x-account-balance');
        this.$secureIcon = this.$('.secure-icon');
    }

    listeners() {
        return {
            'click': this._onAccountSelected
        }
    }

    static mapStateToProps(state, props) {
        return {
            ...state.accounts.entries.get(props.address)
        };
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
        this.$balance.textContent = this._formatBalance(balance);
    }

    set type(type) {
        if (type === 'high') this.$secureIcon.classList.remove('hidden');
    }

    set account(account) {
        this.setProperties(account);
    }

    get account() {
        return this.properties;
    }

    _onAccountSelected() {
        this.fire('x-account-selected', this.account);
    }

    _formatBalance(value) {
        return NanoApi.formatValue(value, 3) + ' NIM';
    }
}
