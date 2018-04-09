import XElement from '/libraries/x-element/x-element.js';
import XAccountsDropdown from '../x-accounts/x-accounts-dropdown.js';
import XAddressInput from '../x-address-input/x-address-input.js';
import XAmountInput from '../x-amount-input/x-amount-input.js';
import XExpandable from '../x-expandable/x-expandable.js';
import networkClient from '/apps/safe/src/network-client.js';
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js';
import XPopupMenu from '/elements/x-popup-menu/x-popup-menu.js';
import Config from '/libraries/secure-utils/config/config.js';

export default class XSendTransaction extends XElement {
    html() {
        return `
            <div class="modal-header">
                <x-popup-menu left-align>
                    <button prepared><i class="material-icons">unarchive</i> Prepared transaction</button>
                </x-popup-menu>
                <i x-modal-close class="material-icons">close</i>
                <h2>Transaction</h2>
            </div>
            <form class="modal-body">
                <h3>Send from</h3>
                <x-accounts-dropdown name="sender"></x-accounts-dropdown>
                <span error sender class="display-none"></span>

                <h3>Send to</h3>
                <div class="row">
                    <x-address-input class="multiline" name="recipient"></x-address-input>
                </div>
                <span error recipient class="display-none"></span>

                <h3>Amount</h3>
                <div class="row">
                    <x-amount-input name="value" no-screen-keyboard></x-amount-input>
                </div>
                <span error amount class="display-none"></span>

                <x-expandable advanced-settings transparent>
                    <h3 expandable-trigger>Advanced Settings</h3>
                    <div expandable-content>
                        <h3>Fee</h3>
                        <div class="row">
                            <x-amount-input name="fee" max-decimals="5" no-screen-keyboard></x-amount-input>
                        </div>
                        <span error fees class="display-none"></span>

                        <h3>Valid from</h3>
                        <small>Only required for offline transaction creation</small>
                        <small>Setting a wrong valid-from height can invalidate your transaction!</small>
                        <div class="row">
                            <input name="validityStartHeight" validity-start placeholder="0" type="number" min="0" step="1">
                        </div>
                        <span error start-height class="display-none"></span>
                    </div>
                </x-expandable>

                <div class="center row">
                    <button send>Send</button>
                </div>
            </form>
        `
    }

    children() {
        return [ XPopupMenu, XAccountsDropdown, XAddressInput, XAmountInput, XExpandable ];
    }

    onCreate() {
        this.$form = this.$('form');
        this.$button = this.$('button[send]');
        this.$addressInput.placeholderColor = '#bbb';

        this.__debouncedValidateRecipient = this.debounce(this.__validateRecipient, 1000, true);

        // To work around the double x-address-input-valid event
        // which happens because of the address formatting when
        // pasting a full address
        this.__lastValidatedValue = null;
        this.__validateRecipientTimeout = null;

        this._errorElements = {};

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
            'click button[prepared]': () => this.fire('x-send-prepared-transaction')
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
        const tx = this._getFormData(this.$form);
        tx.network = Config.network;
        this.fire('x-send-transaction', tx);
    }

    clear() {
        this.$addressInput.value = '';
        this.$amountInput.forEach(input => input.value = '');
        this.$form.querySelector('input[name="validityStartHeight"]').value = '';
        this.$expandable.collapse();
        this._isLoading = false;
    }

    validateAllFields() {
        this._validateSender();
        this._validateRecipient();
        this._validateAmountAndFees();
        this._validateValidityStartHeight();
        this.setButton();
    }

    set loading(isLoading) {
        this._isLoading = !!isLoading;
        this.$button.textContent = this._isLoading ? 'Loading' : 'Send';
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
        this.$button.disabled = !this._isValid() || this._isLoading;
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
        if (MixinRedux.store.getState().network.consensus === 'established') {
            this._validSender = !!(account && account.balance > 0);
            if (this._validSender) {
                this._clearError('sender');
            } else {
                this._setError('This account has no balance', 'sender');
            }
        }
        else {
            this._validSender = !!account;
        }

        this._validateRecipient(true);
    }

    _validateRecipient(forceValidate) {
        const address = this.$addressInput.value;
        const value = this.$addressInput.$input.value;

        if (value === this.__lastValidatedValue && !this.__validateRecipientTimeout && !forceValidate) return;
        this.__lastValidatedValue = value;

        clearTimeout(this.__validateRecipientTimeout);
        this.__validateRecipientTimeout = null;

        this._validRecipient = false;

        console.log(address, this.$accountsDropdown.selectedAccount.address);
        if (address === this.$accountsDropdown.selectedAccount.address) {
            this._setError('This is the same address as the sender', 'recipient');
            return;
        }

        // TODO Skip network request when doing airgapped tx creation
        if (address) {
            if (MixinRedux.store.getState().network.consensus !== 'established') {
                if (Config.offline) {
                    this._setError('Cannot validate address in offline mode', 'recipient');
                    this._validRecipient = true;
                } else {
                    this._setError('Cannot validate address (not connected). Retrying...', 'recipient');
                    this.__validateRecipientTimeout = setInterval(this._validateRecipient.bind(this), 1000);
                    this._validRecipient = true;
                }
            } else {
                this.__debouncedValidateRecipient(address);
            }
        } else if (value.length === 0) {
            this._clearError('recipient');
        } else {
            this._setError('Invalid address', 'recipient');
        }
    }

    async __validateRecipient(address) {
        this._validatingRecipientTimeout = setTimeout(() => this._setError('Validating address type, please wait...', 'recipient'), 1000);

        const accountType = await (await networkClient.rpcClient).getAccountTypeString(address);

        this._validRecipient = (accountType === 'basic');

        clearTimeout(this._validatingRecipientTimeout);

        if (this._validRecipient) {
            this._clearError('recipient');
        } else {
            this._setError('Cannot send to this account type', 'recipient');
        }

        // Because this is a debounced async function, there is no external way
        // no know if this function finished, so we need to do that action in here
        this.setButton();
    }

    _validateAmountAndFees() {
        const account = this.$accountsDropdown.selectedAccount;

        const amount = this.$amountInput[0].value;
        const fees = this.$amountInput[1].value;

        if (amount < 0) {
            this._setError('You cannot send a negative amount', 'amount');
        }
        if (amount === 0) {
            this._clearError('amount');
        }

        if (fees < 0) {
            this._setError('Negative fees are not allowed', 'fees');
        } else {
            this._clearError('fees');
        }

        if (amount <= 0 || fees < 0) {
            this._validAmountAndFees = false;
            return;
        }

        if (MixinRedux.store.getState().network.consensus === 'established') {
            this._validAmountAndFees = !!(account && account.balance >= (amount + fees));

            if (!this._validAmountAndFees) {
                this._setError('You do not have enough funds', 'amount');
            } else {
                this._clearError('amount');
            }
        }
        else {
            this._validAmountAndFees = true;
        }
    }

    _validateValidityStartHeight() {
        // TODO: Validate validityStartHeight?
        const value = this.$('input[validity-start]').value || 0;

        this._validValidityStartHeight = !!(value >= 0);

        if (this._validValidityStartHeight) {
            this._clearError('start-height');
        } else {
            this._setError('Cannot set a negative start height', 'start-height');
        }
    }

    _isValid() {
        // console.log(
        //     "sender", this._validSender,
        //     "recipient", this._validRecipient,
        //     "amountandFees", this._validAmountAndFees,
        //     "validityStartHeight", this._validValidityStartHeight
        // );
        return this._validSender && this._validRecipient && this._validAmountAndFees && this._validValidityStartHeight;
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

    _setError(msg, field) {
        let $el = this._errorElements[field];
        if (!$el) this._errorElements[field] = $el = this.$(`span[error][${field}]`);

        if (msg) {
            $el.textContent = msg;
            $el.classList.remove('display-none');
        } else {
            $el.classList.add('display-none');
        }
    }

    _clearError(field) {
        this._setError('', field);
    }
}

// TODO make fee a slider
// TODO make validity start a slider
// TODO offer to create account when no account available
