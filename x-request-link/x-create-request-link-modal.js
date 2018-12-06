import MixinModal from '/elements/mixin-modal/mixin-modal.js';
import XElement from '/libraries/x-element/x-element.js';
import XAddress from '/elements/x-address/x-address.js';
import XAccountsDropdown from '../x-accounts/x-accounts-dropdown.js';
import XAmountInput from '/elements/x-amount-input/x-amount-input.js';
import { spaceToDash } from '/libraries/nimiq-utils/parameter-encoding/parameter-encoding.js';
import share from '/libraries/web-share-shim/web-share-shim.nimiq.min.js';
import Config from '/libraries/secure-utils/config/config.js';

export default class XCreateRequestLinkModal extends MixinModal(XElement) {
    html() {
        return `
            <div class="modal-header">
                <i x-modal-close class="material-icons">close</i>
                <h2>Transaction Request</h2>
            </div>
            <div class="modal-body">
                <div class="center">
                    <x-accounts-dropdown name="recipient"></x-accounts-dropdown>
                    <ul>
                        <li>
                            <div class="address-label">Copy your address:</div>
                            <x-address></x-address>
                        </li>
                        <li>
                            <div>Or create a transaction request link:</div>
                            <div class="spacing-top"><x-amount-input></x-amount-input></div>
                        </li>
                        <li>
                            <div class="spacing-top">Copy your link:</div>
                            <div class="x-request-link"></div>
                        </li>
                    </ul>
                </div>
            </div>
        `;
    }

    children() {
        return [ XAddress, XAccountsDropdown, XAmountInput ];
    }

    onCreate() {
        navigator.share = share;
        super.onCreate();
    }

    listeners() {
        return {
            'x-account-selected': this._onAccountSelected.bind(this),
            'click .x-request-link': () => navigator.share({
                title: 'Nimiq Transaction Request',
                text: 'Please send me Nimiq using this link:',
                url: this._link
            }),
            'input x-amount-input input': this._updateLink.bind(this)
        }
    }

    _onAccountSelected(address) {
        this._setAccount(address);
    }

    _setAccount(address) {
        this.$address.address = address;
        this._address = address;
        this._updateLink();
    }

    _updateLink() {
        const amount = this.$amountInput.value > 0 ? `/${this.$amountInput.value}` : '';

        this._link = `${ Config.offlinePackaged ? 'https://safe.nimiq.com' : this.attributes.dataXRoot }#_request/${spaceToDash(this._address)}${amount}_`;
        const $requestLink = this.$('.x-request-link');
        $requestLink.textContent = this._link;
    }
}
