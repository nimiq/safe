import MixinModal from '/elements/mixin-modal/mixin-modal.js';
import XElement from '/libraries/x-element/x-element.js';
import XAddress from '/elements/x-address/x-address.js';
import XAccountsDropdown from '../x-accounts/x-accounts-dropdown.js';
import { spaceToDash } from '/libraries/nimiq-utils/parameter-encoding/parameter-encoding.js';

export default class XCreateRequestLinkModal extends MixinModal(XElement) {
    html() {
        return `
            <div class="modal-header">
                <h2>Create Transaction Request</h2>
            </div>
            <div class="modal-body">
                <center>
                    <x-accounts-dropdown name="recipient"></x-accounts-dropdown>
                    <ul>
                        <li>
                            Copy address:<x-address></x-address>
                        </li>
                        <li>
                            OR use the following link to request a transaction 
                            <div class="x-request-link"></div>
                        </li>
                    </ul>
                </center>
            </div>
        `;
    }

    children() {
        return [ XAddress, XAccountsDropdown ];
    }

    listeners() {
        return {
            'x-account-selected': this._onAccountSelected.bind(this)
        }
    }

    _onAccountSelected(address) {
        this._setAccount(address);
    }

    _setAccount(address) {
        this.$address.address = address;

        const $requestLink = this.$('.x-request-link');

        $requestLink.textContent = `${ this.attributes.dataXRoot }/#_request/${spaceToDash(address)}_`;
    }
}
