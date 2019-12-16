import XElement from '../../lib/x-element/x-element.js';
import MixinModal from '../mixin-modal/mixin-modal.js';

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
                <button class="nq-button light-blue">Send now</button>
            </div>
        `
    }

    onCreate() {
        this.$textarea = this.$('textarea');
        this.$button = this.$('button');
        super.onCreate();
    }

    listeners() {
        return {
            'click button': () => this.fire('x-send-prepared-transaction-confirm', JSON.parse(this.$textarea.value))
        }
    }

    onShow() {
        this.$textarea.value = '';
        this.loading = false;
    }

    set loading(isLoading) {
        this._isLoading = !!isLoading;
        this.$button.textContent = this._isLoading ? 'Loading' : 'Send now';
        this.$button.disabled = this._isLoading;
    }
}
