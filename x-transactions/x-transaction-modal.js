import MixinModal from '/elements/mixin-modal/mixin-modal.js';
import XAddress from '/elements/x-address/x-address.js';
import XTransaction from './x-transaction.js';
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js';
import ValidationUtils from '/libraries/secure-utils/validation-utils/validation-utils.js';

export default class XTransactionModal extends MixinModal(XTransaction) {
    html() {
        return `
            <div class="modal-header">
                <h2>Transaction</h2>
            </div>
            <div class="modal-body">
                <center>
                    <x-identicon sender></x-identicon>
                    <div class="label" sender></div>
                    <x-address sender></x-address>
                    <div><i class="material-icons">arrow_downward</i></div>
                    <x-identicon recipient></x-identicon>
                    <div class="label" recipient></div>
                    <x-address recipient></x-address>

                    <x-amount label="Value"></x-amount>

                    <label>Time</label>
                    <div class="timestamp" title="">pending...</div>

                    <label>Block height</label>
                    <div class="blockHeight"></div> <div class="confirmations"></div>

                    <div class="fee-section display-none">
                        <label>Fee</label>
                        <div class="fee"></div>
                    </div>
                </center>
            </div>
        `
    }

    children() { return super.children().concat([XAddress]) }

    onCreate() {
        this.$senderAddress = this.$address[0];
        this.$recipientAddress = this.$address[1];
        this.$blockHeight = this.$('div.blockHeight');
        this.$confirmations = this.$('div.confirmations');
        this.$fee = this.$('div.fee');
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

    set fee(fee) {
        if (!fee) this.$('.fee-section').classList.add('display-none');
        else this.$('.fee-section').classList.remove('display-none');
        this.$fee.textContent = fee + ' NIM';
    }

    set blockHeight(blockHeight) {
        this.$blockHeight.textContent = `#${blockHeight}`;
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
        if (!this.properties.currentHeight || !this.properties.blockHeight) {
            if (this.$confirmations) this.$confirmations.textContent = '';
            return;
        }
        const confirmations = this.properties.currentHeight - this.properties.blockHeight;
        this.$confirmations.textContent = `(${confirmations} confirmation${confirmations === 1 ? '' : 's'})`;
    }

    allowsShow(hash) {
        hash = decodeURIComponent(hash);
        return ValidationUtils.isValidHash(hash);
    }

    onShow(hash) {
        hash = decodeURIComponent(hash);

        let transaction = MixinRedux.store.getState().transactions.entries.get(hash);
        if (!transaction) transaction = { hash };
        this.transaction = transaction;
    }
}
