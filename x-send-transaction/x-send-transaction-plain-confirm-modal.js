import XElement from '/libraries/x-element/x-element.js';
import MixinModal from '/elements/mixin-modal/mixin-modal.js';

export default class XSendTransactionPlainConfirmModal extends MixinModal(XElement) {
    html() {
        return `
            <div class="modal-header">
                <h2>Confirm Transaction</h2>
            </div>
            <div class="modal-body">
                <p>
                    The transaction has been signed and can now be sent to the network:
                </p>
                <textarea></textarea>
                <button>Send now</button>
            </div>
        `
    }

    onCreate() {
        this.$textarea = this.$('textarea');
        this._sent = false;
        super.onCreate();
    }

    listeners() {
        return {
            'click button': () => this.fire('x-send-transaction-confirm', JSON.parse(this._txString))
        }
    }

    sent() {
        this._sent = true;
    }

    set transaction(tx) {
        const clonedTx = { ...tx };
        clonedTx.senderPubKey = [...tx.senderPubKey];
        clonedTx.signature = [...tx.signature];

        const txString = JSON.stringify(clonedTx).replace(/,"/g, ', "');
        this._txString = txString;

        this.$textarea.value = txString;
    }

    _onBeforeHide() {
        return this._sent || confirm("Really CANCEL this transaction?");
    }
}
