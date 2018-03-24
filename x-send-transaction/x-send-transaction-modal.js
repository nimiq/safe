import XSendTransaction from './x-send-transaction.js';
import MixinModal from '../mixin-modal/mixin-modal.js';

export default class XSendTransactionModal extends MixinModal(XSendTransaction) {
    onCreate() {
        super.onCreate();
        this.$addressInput.placeholderColor = 'black';
    }
}
