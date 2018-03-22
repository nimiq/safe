import XElement from '/libraries/x-element/x-element.js';
import XIdenticon from '../x-identicon/x-identicon.js';
import XAccountsDropdown from '../x-accounts/x-accounts-dropdown.js';
import XAddressInput from '../x-address-input/x-address-input.js';

export default class XSendTransaction extends XElement {
    html() {
        return `
            <h2>Send Transaction</h2>
            <form class="x-modal-body">
                <h3>Send from</h3>
                <x-accounts-dropdown name="sender"></x-accounts-dropdown>

                <h3>Send to</h3>
                <div class="row">
                    <x-identicon></x-identicon>
                    <x-address-input name="recipient"></x-address-input>
                </div>

                <h3>Amount</h3>
                <div class="row">
                    <input name="value" amount placeholder="0.00" type="number" min="0" step="0.00001">
                </div>

                <h3>Fee</h3>
                <div class="row">
                    <input name="fee" fee placeholder="0.00" type="number" min="0" step="0.00001">
                </div>

                <h3>Valid from</h3>
                <div class="row">
                    <input name="validityStartHeight" validity-start placeholder="0" type="number" min="0" step="1">
                </div>

                <div class="center row">
                    <button send>Send</button>
                </div>
            </form>
        `
    }

    children() {
        return [ XIdenticon, XAccountsDropdown, XAddressInput ];
    }

    onCreate() {
        this.$form = this.$('form');
    }

    listeners() {
        return {
            'submit form': this._onSubmit.bind(this)
        }
    }

    _onSubmit(e) {
        e.preventDefault();
        // const formData = new FormData(this.$form); // I don't know why this doesn't work...
        const formData = this._getFormData(this.$form);
        this.fire('x-send-transaction', formData);
    }

    clear(validityStartHeight) {
        this.$form.reset();
        this.$form.querySelector('input[name="validityStartHeight"]').value = validityStartHeight;
    }

    _getFormData(form) {
        const formData = {};
        form.querySelectorAll('input').forEach(i => formData[i.getAttribute('name')] = i.value);
        return formData;
    }
}

// TODO make fee a slider
// TODO make fee and validity start height collapsible
// TODO autofill validity start height
// TODO check balance
// TODO offer to create account when no account available
// TODO replace amount input by x-amount-input
// TODO include recipient identicon into x-address-input
