import XElement from '/libraries/x-element/x-element.js';
import MixinModal from '/elements/mixin-modal/mixin-modal.js';

export default class XSendTransactionOfflineModal extends MixinModal(XElement) {
    html() {
        return `
            <div class="modal-header">
                <h2>Offline Transaction</h2>
            </div>
            <div class="modal-body">
                <strong>It looks like you are not connected to the network.</strong>
                <p>You can copy the text below to save your transaction and submit it when you are connected.</p>
                <small>Note: the transaction is only valid for 120 blocks (~2 hours) after its validity-start-height.</small>
                <br><br>
                <textarea></textarea>
                <!-- <button>Send now</button> -->
            </div>
        `
    }

    onCreate() {
        this.$textarea = this.$('textarea');
        this._sent = false;
        super.onCreate();
    }

    // listeners() {
    //     return {
    //         'click button': () => this.fire('x-send-transaction-confirm', JSON.parse(this._txString))
    //     }
    // }

    sent() {
        this._sent = true;
    }

    set transaction(tx) {
        if (typeof tx === 'string') {
            this._txString = tx;
        } else {
            const clonedTx = Object.assign({}, tx, {});
            clonedTx.senderPubKey = [...tx.senderPubKey];
            clonedTx.signature = [...tx.signature];

            this._txString = JSON.stringify(clonedTx).replace(/,"/g, ', "');
        }

        this.$textarea.value = this._txString;
    }

    allowsHide() {
        return this._sent || confirm("Close the transaction window?");
    }
}
