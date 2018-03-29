import XElement from '/libraries/x-element/x-element.js';
import XAccountsDropdown from '../x-accounts/x-accounts-dropdown.js';
import XAddressInput from '../x-address-input/x-address-input.js';
import XAmountInput from '../x-amount-input/x-amount-input.js';
import XExpandable from '../x-expandable/x-expandable.js';
import networkClient from '/apps/safe/network-client.js';

export default class XSendTransaction extends XElement {
    html() {
        return `
            <div class="modal-header">
                <h2>Send Transaction</h2>
            </div>
            <form class="modal-body">
                <h3>Send from</h3>
                <x-accounts-dropdown name="sender"></x-accounts-dropdown>

                <h3>Send to</h3>
                <div class="row">
                    <x-address-input class="multiline" name="recipient"></x-address-input>
                </div>

                <h3>Amount</h3>
                <div class="row">
                    <x-amount-input name="value" no-screen-keyboard></x-amount-input>
                </div>

                <x-expandable advanced-settings transparent>
                    <h3 expandable-trigger>Advanced Settings</h3>
                    <div expandable-content>
                        <h3>Fee</h3>
                        <div class="row">
                            <x-amount-input name="fee" no-screen-keyboard></x-amount-input>
                        </div>

                        <h3>Valid from</h3>
                        <small>Only required for offline transaction creation</small>
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
        this.$button = this.$('button[send]');
        this.$addressInput.placeholderColor = '#bbb';

        this.__debouncedValidateRecipient = this.debounce(this.__validateRecipient, 1000, true);

        // To work around the double x-address-input-valid event
        // which happens because of the address formatting when
        // pasting a full address
        this.__lastValidatedAddress = '';

        this.clear();
    }

    styles() {
        return [ ...super.styles(), 'x-send-transaction' ];
    }

    listeners() {
        return {
            'submit form': this._onSubmit.bind(this),
            'x-account-selected': () => this._validateField('sender'),
            'x-address-input-valid': () => this._validateField('recipient'),
            'input input[name="value"]': () => this._validateField('amount'),
            'input input[name="fee"]': () => this._validateField('fees'),
            'input input[name="validityStartHeight"]': () => this._validateField('validityStartHeight'),
        }
    }

    set sender(accountOrAddress) {
        this.$accountsDropdown.selectedAccount = accountOrAddress;
    }

    set recipient(address) {
        this.$addressInput.value = address;
    }

    _onSubmit(e) {
        e.preventDefault();
        if (!this._isValid()) return;

        // const formData = new FormData(this.$form); // I don't know why this doesn't work...
        const formData = this._getFormData(this.$form);
        this.fire('x-send-transaction', formData);
    }

    clear() {
        this.$addressInput.value = '';
        this.$amountInput.forEach(input => input.value = '');
        this.$form.querySelector('input[name="validityStartHeight"]').value = '';

        this._validateSender();
        this._validateRecipient();
        this._validateAmountAndFees();
        this._validateValidityStartHeight();
        this.setButton();
    }

    _getFormData(form) {
        const formData = {};
        form.querySelectorAll('input').forEach(i => formData[i.getAttribute('name')] = i.value);
        return formData;
    }

    /**
     * VALIDATION METHODS
     */

    setButton() {
        this.$button.disabled = !this._isValid();
    }

    /**
     * @returns {nothing valuable} The return statement is just used for quitting the function early
     */
    async _validateField(field) {
        switch (field) {
            case 'recipient':
                this._validateRecipient();
                break;
            case 'sender':
                this._validateSender();
            case 'amount':
            case 'fees':
                this._validateAmountAndFees();
                break;
            case 'validityStartHeight':
                this._validateValidityStartHeight();
                break;
        }

        return this.setButton();
    }

    _validateSender() {
        const account = this.$accountsDropdown.selectedAccount;
        this._validSender = !!(account && account.balance > 0);
    }

    _validateRecipient() {
        const address = this.$addressInput.value;

        if (address === this.__lastValidatedAddress) return;
        this.__lastValidatedAddress = address;

        this._validRecipient = false;

        // TODO Skip network request when doing airgapped tx creation
        if (address) this.__debouncedValidateRecipient(address);

        return;
    }

    async __validateRecipient(address) {
        const accountType = await (await networkClient).rpcClient.getAccountTypeString(address);

        this._validRecipient = (accountType === 'basic');

        // Because this is a debounced async function, there is no external way
        // no know if this function finished, so we need to do that action in here
        this.setButton();
    }

    _validateAmountAndFees() {
        const account = this.$accountsDropdown.selectedAccount;

        const amount = this.$amountInput[0].value;
        const fees = this.$amountInput[1].value;

        if (amount <= 0 || fees < 0) {
            this._validAmountAndFees = false;
            return;
        }

        this._validAmountAndFees = !!(account && account.balance >= (amount + fees));
    }

    _validateValidityStartHeight() {
        // TODO: Validate validityStartHeight?
        this._validValidityStartHeigth = true;
    }

    _isValid() {
        console.log(
            "sender", this._validSender,
            "recipient", this._validRecipient,
            "amountandFees", this._validAmountAndFees,
            "validityStartHeight", this._validValidityStartHeigth
        );
        return this._validSender && this._validRecipient && this._validAmountAndFees && this._validValidityStartHeigth;
    }

    // Returns a function, that, as long as it continues to be invoked, will not
    // be triggered. The function will be called after it stops being called for
    // N milliseconds. If `immediate` is passed, trigger the function on the
    // leading edge, instead of the trailing.
    debounce(func, wait) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function(isDummy) {
                timeout = null;
                if (!isDummy) func.apply(context, args);
            };
            var callNow = !timeout;
            clearTimeout(timeout);
            if (callNow) {
                timeout = setTimeout(later, wait, true);
                func.apply(context, args);
            } else {
                timeout = setTimeout(later, wait);
            }
        }
    }
}

// TODO Validation: enable recipient=true when modal loaded from URL
// TODO Validation: prevent double ...-valid event from x-address-input

// TODO make fee a slider
// TODO make validity start a slider
// TODO check balance
// TODO offer to create account when no account available
