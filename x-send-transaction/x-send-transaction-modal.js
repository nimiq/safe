import XSendTransaction from './x-send-transaction.js';
import MixinModal from '../mixin-modal/mixin-modal.js';
import store from '/apps/safe/store.js';

export default class XSendTransactionModal extends MixinModal(XSendTransaction) {
    onCreate() {
        super.onCreate();
        this.$addressInput.placeholderColor = 'black';
    }

    onEntry(address) {
        console.log("XSendTransactionModal onEntry");
        if (address) {
            address = this._dashToSpace(address);
            let account = store.getState().accounts.entries.get(address);
            if (!account) account = { address };
            this.setSelectedSender = account;
        }
        super.onEntry();
    }

    _dashToSpace(string) {
        return string.replace(/-/gi, ' ');
    }
}
