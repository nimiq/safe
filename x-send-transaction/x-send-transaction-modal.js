import XSendTransaction from './x-send-transaction.js';
import MixinModal from '../mixin-modal/mixin-modal.js';
import ValidationUtils from '/libraries/secure-utils/validation-utils/validation-utils.js';
import { dashToSpace } from '/libraries/nimiq-utils/parameter-encoding/parameter-encoding.js';

export default class XSendTransactionModal extends MixinModal(XSendTransaction) {
    allowsShow(address) {
        return address === '-' || !address || ValidationUtils.isValidAddress(dashToSpace(address));
    }

    /* mode: sender or recipient or fromContactList */
    onShow(address, mode, amount, message, freeze) {

        if (mode !== 'contact') this.clear();

        this.$amountInput.maxDecimals = document.body.classList.contains('setting-show-all-decimals') ? 5 : 2;

        if (address && mode === 'sender') {
            this.sender = dashToSpace(address);
        }

        if (address) {
            if (mode === 'recipient') {
                this.recipient = dashToSpace(address);
                this.$addressInput.$input.setAttribute('readonly', true);
            }
            this.$('.link-contact-list').classList.toggle('display-none', mode === 'recipient');
        }

        if (address && mode === 'contact' && address !== '-') {
            this.recipient = dashToSpace(address);
        }

        if (amount) {
            this.amount = amount;
            this.$amountInput.$input.setAttribute('readonly', true);
        }

        if (message) {
            this.message = decodeURIComponent(message);
            this.$extraDataInput.$input.setAttribute('readonly', true);
        }

        this.validateAllFields();
    }
}
