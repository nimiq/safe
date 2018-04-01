import XElement from '/libraries/x-element/x-element.js';
import MixinModal from '/elements/mixin-modal/mixin-modal.js';

export default class XSendPreparedTransactionModal extends MixinModal(XElement) {
    html() {
        return `
            <div class="modal-header">
                <i x-modal-close class="material-icons">close</i>
                <h2>Prepared Transaction</h2>
            </div>
            <div class="modal-body">
                <p>Insert the text of your transaction below:</p>
                <small>Note: a transaction is only valid for 120 blocks (~2 hours) after its validity-start-height.</small>
                <br><br>
                <textarea></textarea>
                <button>Send now</button>
            </div>
        `
    }

    onCreate() {
        this.$textarea = this.$('textarea');
        super.onCreate();
    }

    listeners() {
        return {
            'click button': () => this.fire('x-send-prepared-transaction-confirm', JSON.parse(this.$textarea.value))
        }
    }

    onShow() {
        this.$textarea.value = '';
    }
}
