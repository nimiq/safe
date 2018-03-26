import XSendTransaction from './x-send-transaction.js';
import MixinModal from '../mixin-modal/mixin-modal.js';
import MixinRedux from '../mixin-redux/mixin-redux.js';

export default class XSendTransactionModal extends MixinModal(XSendTransaction) {
    onCreate() {
        super.onCreate();
        this.$addressInput.placeholderColor = 'black';
    }

    onEntry(address) {
        if (address) {
            address = this._dashToSpace(address);
            let account = MixinRedux.store.getState().accounts.entries.get(address);
            if (!account) account = { address };
            this.setSelectedSender(account);
        }
        super.onEntry();
    }

    _dashToSpace(string) {
        return string.replace(/-/gi, ' ');
    }
}
