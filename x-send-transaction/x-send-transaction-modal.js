import XSendTransaction from './x-send-transaction.js';
import MixinModal from '../mixin-modal/mixin-modal.js';
import ValidationUtils from '/libraries/secure-utils/validation-utils/validation-utils.js';
import { dashToSpace } from '/libraries/nimiq-utils/parameter-encoding/parameter-encoding.js';

export default class XSendTransactionModal extends MixinModal(XSendTransaction) {
    allowsShow(address) {
        return address === '-' || !address || ValidationUtils.isValidAddress(dashToSpace(address));
    }

    /* mode: 'sender'|'recipient'|'contact'|'vesting' */
    onShow(address, mode, amount, message, freeze) {

        if (mode !== 'contact') this.clear();

        this.$amountInput.maxDecimals = document.body.classList.contains('setting-show-all-decimals') ? 5 : 2;

        if (address && mode === 'sender') {
            this.sender = dashToSpace(address);
        }

        if (address && (mode === 'recipient' || mode === 'vesting')) {
            this.recipient = dashToSpace(address);
            this.$addressInput.$input.setAttribute('readonly', true);
            this.$('.link-contact-list').classList.add('display-none');
        } else {
            this.$addressInput.$input.removeAttribute('readonly');
            this.$('.link-contact-list').classList.remove('display-none');
        }

        if (address && mode === 'contact' && address !== '-') {
            this.recipient = dashToSpace(address);
        }

        if (amount) {
            this.amount = amount;
            this.$amountInput.$input.setAttribute('readonly', true);
        } else {
            this.$amountInput.$input.removeAttribute('readonly');
        }

        if (message) {
            this.message = decodeURIComponent(message);
            this.$extraDataInput.$input.setAttribute('readonly', true);
        } else {
            this.$extraDataInput.$input.removeAttribute('readonly');
        }

        this.validateAllFields();
    }
}
