import UTF8Tools from '/libraries/secure-utils/utf8-tools/utf8-tools.js';
import MixinModal from '/elements/mixin-modal/mixin-modal.js';
import XAddress from '/elements/x-address/x-address.js';
import XTransaction from './x-transaction.js';
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js';
import ValidationUtils from '/libraries/secure-utils/validation-utils/validation-utils.js';

export default class XTransactionModal extends MixinModal(XTransaction) {
    html() {
        return `
            <div class="modal-header">
                <i x-modal-close class="material-icons">close</i>
                <h2>Transaction</h2>
            </div>
            <div class="modal-body">
                <div class="center">
                    <x-identicon sender></x-identicon>
                    <i class="arrow material-icons">arrow_forward</i>
                    <x-identicon recipient></x-identicon>
                </div>

                <div class="center">
                    <x-amount></x-amount>
                </div>

                <div class="row">
                    <label>From</label>
                    <div class="row-data">
                        <div class="label" sender></div>
                        <x-address sender></x-address>
                    </div>
                </div>

                <div class="row">
                    <label>To</label>
                    <div class="row-data">
                        <div class="label" recipient></div>
                        <x-address recipient></x-address>
                    </div>
                </div>

                <div class="extra-data-section display-none row">
                    <label>Message</label>
                    <div class="row-data">
                        <div class="extra-data"></div>
                    </div>
                </div>

                <div class="row">
                    <label>Date</label>
                    <div class="row-data">
                        <div class="timestamp" title="">pending...</div>
                    </div>
                </div>

                <div class="row">
                    <label>Block</label>
                    <div class="row-data">
                        <span class="blockHeight"></span> <span class="confirmations"></span>
                    </div>
                </div>

                <div class="fee-section display-none row">
                    <label>Fee</label>
                    <div class="row-data">
                        <div class="fee"></div>
                    </div>
                </div>
            </div>
        `
    }

    children() { return super.children().concat([XAddress]) }

    listeners() { return [] }

    onCreate() {
        this.$senderAddress = this.$address[0];
        this.$recipientAddress = this.$address[1];
        this.$blockHeight = this.$('span.blockHeight');
        this.$confirmations = this.$('span.confirmations');
        this.$fee = this.$('div.fee');
        this.$message = this.$('div.extra-data');
        super.onCreate();
        this.$senderIdenticon.placeholderColor = '#bbb';
        this.$recipientIdenticon.placeholderColor = '#bbb';
    }

    set sender(address) {
        this.$senderIdenticon.address = address;
        this.$senderAddress.address = address;
    }

    set recipient(address) {
        this.$recipientIdenticon.address = address;
        this.$recipientAddress.address = address;
    }

    set senderLabel(label) {
        this.$senderLabel.textContent = label;
        this.$senderLabel.classList.toggle('default-label', label.startsWith('NQ'));
    }

    set recipientLabel(label) {
        this.$recipientLabel.textContent = label;
        this.$recipientLabel.classList.toggle('default-label', label.startsWith('NQ'));
    }

    set extraData(extraData) {
        this.$('.extra-data-section').classList.toggle('display-none', !extraData);
        this.$message.textContent = UTF8Tools.utf8ByteArrayToString(extraData);
    }

    set fee(fee) {
        this.$('.fee-section').classList.toggle('display-none', !fee);
        this.$fee.textContent = fee + ' NIM';
    }

    set blockHeight(blockHeight) {
        if (this.properties.removed || this.properties.expired) {
            this.$blockHeight.textContent = '-';
        } else {
            this.$blockHeight.textContent = blockHeight > 0 ? `#${blockHeight}` : '';
        }
        this._calcConfirmations();
    }

    set timestamp(timestamp) {
        const time = moment.unix(timestamp);
        this.$timestamp.textContent = `${time.toDate().toLocaleString()} (${time.fromNow()})`;
    }

    set currentHeight(height) {
        this._calcConfirmations();
    }

    _calcConfirmations() {
        if (!this.properties.currentHeight || !this.properties.blockHeight || this.properties.removed || this.properties.expired) {
            if (this.$confirmations) this.$confirmations.textContent = '';
            return;
        }
        const confirmations = this.properties.currentHeight - this.properties.blockHeight;
        this.$confirmations.textContent = `(${confirmations} confirmation${confirmations === 1 ? '' : 's'})`;
    }

    allowsShow(hash) {
        if (!hash) return true;
        hash = decodeURIComponent(hash);
        return ValidationUtils.isValidHash(hash);
    }

    onShow(hash) {
        if (!hash) return;

        hash = decodeURIComponent(hash);

        let transaction = MixinRedux.store.getState().transactions.entries.get(hash);
        if (!transaction) transaction = { hash };
        this.transaction = transaction;
    }
}
