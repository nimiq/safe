import XElement from '/libraries/x-element/x-element.js';
import XIdenticon from '../x-identicon/x-identicon.js';
import XAddress from '../x-address/x-address.js';
import XModal from '../x-modal/x-modal.js';
import NanoApi from '/libraries/nano-api/nano-api.js';

export class XAccount extends XElement {
    html() {
        return `
            <x-identicon></x-identicon>
            <div class="x-account-info">
                <span class="x-account-label"></span>
                <x-address></x-address>
                <div class="x-account-bottom">
                    <i class="hidden secure-icon" label="High security account"></i>
                    <span class="x-account-balance">
                        <span class="dot-loader"></span> NIM
                    </span>
                </div>
            </div>
        `
    }
    children() { return [XIdenticon, XAddress] }

    onCreate() {
        this.$label = this.$('.x-account-label');
        this.$balance = this.$('.x-account-balance');
        this.$secureIcon = this.$('.secure-icon');
    }

    listeners() {
        return {
            'click': this._onAccountSelected
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

    // 'name' is a reserved property of XElement
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

    _onAccountSelected() {
        this.fire('x-account-selected', this._address);
    }

    _formatBalance(value) {
        return NanoApi.formatValue(value, 3) + ' NIM';
    }
}

export class XAccountModal extends XModal(XAccount) {
    html() {
        return `
            <h2>Account Details</h2>
            <x-identicon></x-identicon>
            <span class="x-account-label"></span>
            <x-address></x-address>
            <i class="hidden secure-icon" label="High security account"></i>
            <span class="x-account-balance">
                <span class="dot-loader"></span> NIM
            </span>
            <button export class="secondary">Export</button>
            <button rename class="secondary">Rename</button>
            <button send>Send from this account</button>
        `
    }

    listeners() {
        return {
            'click button[export]': _ => XToast.show('Export account: ' + this._address),
            'click button[rename]': _ => XToast.show('Rename account: ' + this._address),
            'click button[send]': _ => XToast.show('Send from account: ' + this._address)
        }
    }
}
