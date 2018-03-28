import MixinModal from '/elements/mixin-modal/mixin-modal.js';
import XElement from '/libraries/x-element/x-element.js';
import XIdenticon from '/elements/x-identicon/x-identicon.js';
import XAddress from '/elements/x-address/x-address.js';
import ValidationUtils from '/libraries/nimiq-utils/validation-utils/validation-utils.js';
import { dashToSpace, spaceToDash } from '/libraries/nimiq-utils/parameter-encoding/parameter-encoding.js';
import XRouter from '/elements/x-router/x-router.js';

export default class XReceiveRequestLinkModal extends MixinModal(XElement) {
    html() {
        return `
            <div class="modal-header">
                <h2>Transaction Request</h2>
            </div>
            <div class="modal-body">
                <div class="center">
                    <x-identicon></x-identicon>
                    <i class="display-none account-icon"></i>
                    <x-address></x-address>
                    <div class="x-message">Someone send you a link to request a transaction.</div>

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

    onShow(address) {
        address = dashToSpace(address);
        this.$identicon.address = address;
        this.$address.address = address;
        this._address = address;
    }

    listeners() {
        return {
            'click a.cancel': () => this.hide(),
            'click button.confirm': async () =>
                (await XRouter.instance).showAside('new-transaction', `recipient=${spaceToDash(this._address)}`)
        }
    }
}

// todo [v2] handle message and value