import MixinModal from '/elements/mixin-modal/mixin-modal.js';
import XElement from '/libraries/x-element/x-element.js';
import XIdenticon from '/secure-elements/x-identicon/x-identicon.js';
import XAddress from '/elements/x-address/x-address.js';
import ValidationUtils from '/libraries/secure-utils/validation-utils/validation-utils.js';
import { dashToSpace, spaceToDash } from '/libraries/nimiq-utils/parameter-encoding/parameter-encoding.js';
import XRouter from '/secure-elements/x-router/x-router.js';

export default class XReceiveRequestLinkModal extends MixinModal(XElement) {
    html() {
        return `
            <div class="modal-header">
                <i x-modal-close class="material-icons">close</i>
                <h2>Transaction Request</h2>
            </div>
            <div class="modal-body">
                <div class="center">
                    <x-identicon></x-identicon>
                    <i class="display-none account-icon"></i>
                    <x-address></x-address>
                    <div class="x-message">Someone sent you a link to request a transaction. Please proceed to see
                    further details.</div>

                    <button class="confirm">Ok</button>
                    <a class="cancel" secondary>Cancel</a>
                </div>
            </div>
        `;
    }

    children() {
        return [ XIdenticon, XAddress ];
    }


    allowsShow(address) {
        address = dashToSpace(address);
        return ValidationUtils.isValidAddress(address);
    }

    onShow(address, amount, message) {
        address = dashToSpace(address);
        this.$identicon.address = address;
        this.$address.address = address;
        this._address = address;
        this._message = message;
        this._amount = amount;
    }

    listeners() {

        return {
            'click a.cancel': () => this.hide(),
            'click button.confirm': async () => {
                 // encode parameters if needed
                const amount = this._amount > 0 ? `/${this._amount}` : '';
                const message = this._message ? `/${this._message}` : '';
                (await XRouter.instance).replaceAside(
                    'request',
                    'new-transaction',
                    `${spaceToDash(this._address)}/recipient${amount}${message}`,
                );
            }
        }
    }
}
