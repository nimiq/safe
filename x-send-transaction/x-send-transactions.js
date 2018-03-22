import XElement from '/libraries/x-element/x-element.js';
import XIdenticon from '../x-identicon/x-identicon.js';
import XAccountsDropdown from '../x-accounts/x-accounts-dropdown.js';
import XAddressInput from '../x-address-input/x-address-input.js';

export default class XSendTransaction extends XElement {
    html() {
        return `
            <h2>Send Transaction</h2>
            <div class="x-modal-body">
                <h3>Send from</h3>
                <x-accounts-dropdown></x-accounts-dropdown>
                
                <h3>Send to</h3>
                <div class="row">
                    <x-identicon></x-identicon>
                    <x-address-input></x-address-input>
                </div>
                
                <h3>Amount</h3>
                <div class="row">
                    <input amount placeholder="0.00" type="number" min="0" step="0.00001">
                </div>
                
                <h3>Fee</h3>
                <div class="row">
                    <input fee placeholder="0.00" type="number" min="0" step="0.00001">
                </div>
                
                <h3>Valid from</h3>
                <div class="row">
                    <input validity-start placeholder="0" type="number" min="0" step="1">
                </div>
                
                <div class="center row">
                    <button send>Send</button>
                </div>
            </div>
        `
    }

    children() {
        return [ XIdenticon, XAccountsDropdown, XAddressInput ];
    }

    listeners() {
        return {
            'click button[send]': () => XToast.show('Clicked send ...')
        };
    }
}

// TODO make fee a slider
// TODO make fee and validity start height collapsible
// TODO autofill validity start height
// TODO check balance
// TODO offer to create account when no account available
// TODO replace amount input by x-amount-input
// TODO include recipient identicon into x-address-input
