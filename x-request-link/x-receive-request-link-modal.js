import MixinModal from '/elements/mixin-modal/mixin-modal.js';
import XElement from '/libraries/x-element/x-element.js';
import XIdenticon from '/elements/x-identicon/x-identicon.js';
import XAddress from '/elements/x-address/x-address.js';
import NanoApi from '/libraries/nano-api/nano-api.js';
import { dashToSpace } from '/libraries/nimiq-utils/parameter-encoding/parameter-encoding.js';

export default class XReceiveRequestLinkModal extends MixinModal(XElement) {
    html() {
        return `
            <div class="modal-header">
                <h2>Transaction Request</h2>
            </div>
            <div class="modal-body">
                <center>
                    <x-identicon></x-identicon>
                    <i class="display-none account-icon"></i>
                    <x-address></x-address>
                    Someone send you a link to request a transaction.
                </center>

                <div class="action-buttons">
                    <hr>

                    <button backup class="secondary small">Cancel</button>
                    <button send class="small">Ok</button>
                </div>
            </div>
        `;
    }

    children() {
        return [ XIdenticon, XAddress ];
    }


    allowsShow(address) {
        address = dashToSpace(address);
        return NanoApi.validateAddress(address);
    }

    onShow(address) {
        address = dashToSpace(address);
        this.$identicon.address = address;
        this.$address.value = address;
    }
}