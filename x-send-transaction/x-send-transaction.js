import XElement from '/libraries/x-element/x-element.js';
import XAccountsDropdown from '../x-accounts/x-accounts-dropdown.js';
import XAddressInput from '../x-address-input/x-address-input.js';
import XAmountInput from '../x-amount-input/x-amount-input.js';
import XExpandable from '../x-expandable/x-expandable.js';

export default class XSendTransaction extends XElement {
    html() {
        return `
            <h2>Send Transaction</h2>
            <form class="x-modal-body">
                <h3>Send from</h3>
                <x-accounts-dropdown name="sender"></x-accounts-dropdown>

                <h3>Send to</h3>
                <div class="row">
                    <x-address-input name="recipient"></x-address-input>
                </div>

                <h3>Amount</h3>
                <div class="row">
                    <x-amount-input name="value" no-screen-keyboard max-decimals="5"></x-amount-input>
                </div>

                <x-expandable advanced-settings transparent>
                    <h3 expandable-trigger>Advanced Settings</h3>
                    <div expandable-content>
                        <h3>Fee</h3>
                        <div class="row">
                            <x-amount-input name="fee" no-screen-keyboard max-decimals="5"></x-amount-input>
                        </div>
        
                        <h3>Valid from</h3>
                        <div class="row">
                            <input name="validityStartHeight" validity-start placeholder="0" type="number" min="0" step="1">
                        </div>
                    </div>                
                </x-expandable>

                <div class="center row">
                    <button send>Send</button>
                </div>
            </form>
        `
    }

    children() {
        return [ XAccountsDropdown, XAddressInput, XAmountInput, XExpandable ];
    }

    onCreate() {
        this.$form = this.$('form');
    }

    styles() {
        return [ ...super.styles(), 'x-send-transaction' ];
    }

    listeners() {
        return {
            'submit form': this._onSubmit.bind(this)
        }
    }

    setSelectedSender(account) {
        this.$accountsDropdown.selectedAccount = account;
    }

    _onSubmit(e) {
        e.preventDefault();
        // const formData = new FormData(this.$form); // I don't know why this doesn't work...
        const formData = this._getFormData(this.$form);
        this.fire('x-send-transaction', formData);
    }

    clear(validityStartHeight) {
        this.$addressInput.value = '';
        this.$amountInput.forEach(input => input.value = '');
        this.$form.querySelector('input[name="validityStartHeight"]').value = validityStartHeight || '';
    }

    _getFormData(form) {
        const formData = {};
        form.querySelectorAll('input').forEach(i => formData[i.getAttribute('name')] = i.value);
        return formData;
    }
}

// TODO make fee a slider
// TODO make validity start a slider
// TODO check balance
// TODO offer to create account when no account available
// TODO replace amount input by x-amount-input
