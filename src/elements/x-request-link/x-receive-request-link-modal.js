import { ValidationUtils } from '@nimiq/utils';
import { MixinModalX } from '../mixin-modal/mixin-modal';
import XElement from '../../lib/x-element/x-element.js';
import XIdenticon from '../x-identicon/x-identicon.js';
import XAddress from '../x-address/x-address';
import { dashToSpace, spaceToDash } from '../../lib/parameter-encoding.js';
import XRouter from '../x-router/x-router.js';

export default class XReceiveRequestLinkModal extends MixinModalX(XElement) {
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
        address = address.replace(/[\+ ]/g, '').match(/.{4}/g).join(' '); // Format address in blocks of 4
        this.$identicon.address = address;
        this.$address.address = address;
        this._address = address;
        this._message = decodeURIComponent(message || '');
        this._amount = amount;
    }

    listeners() {
        return {
            'click a.cancel': () => this.hide(),
            'click button.confirm': async () => {
                // encode parameters
                const params = [
                    spaceToDash(this._address),
                    'recipient', // mode of x-send-transaction-modal
                    this._amount || '',
                    encodeURIComponent(this._message || ''),
                ];
                // don't encode unnecessary empty params if they are not followed by non-empty params
                while (params[params.length - 1] === '') params.pop();
                (await XRouter.instance).replaceAside(
                    'request',
                    'new-transaction',
                    params.join('/'),
                );
            }
        }
    }
}
