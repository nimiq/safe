import MixinModal from '../mixin-modal/mixin-modal.js';
import XAddress from '../x-address/x-address.js';
import XToast from '../x-toast/x-toast.js';
import XTransaction from './x-transaction.js';
import store from '/apps/safe/store.js';

export default class XTransactionModal extends MixinModal(XTransaction) {
    html() {
        return `
            <div class="x-modal-header">
                <h2>Transaction Detail</h2>
            </div>
            <div class="x-modal-body">
                <center>
                    <x-identicon sender></x-identicon>
                    <div class="label" sender></div>
                    <x-address sender></x-address>
                    <div>&#8675;</div>
                    <x-identicon recipient></x-identicon>
                    <div class="label" recipient></div>
                    <x-address recipient></x-address>
                </center>

                <label>Value:</label> <x-amount></x-amount>
                <label>Time:</label> <div class="timestamp" title="">pending...</div>
                <label>Block height:</label> <div class="blockHeight"></div> <div class="confirmations"></div>
                <label>Fee:</label> <div class="fee"></div>
                <label>Hash:</label> <div class="hash"></div>
            </div>
        `
    }

    children() { return super.children().concat([XAddress]) }

    onCreate() {
        super.onCreate();
        this.$senderAddress = this.$address[0];
        this.$recipientAddress = this.$address[1];
        this.$blockHeight = this.$('div.blockHeight');
        this.$confirmations = this.$('div.confirmations');
        this.$fee = this.$('div.fee');
        this.$hash = this.$('div.hash');
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

    set hash(hash) {
        this.$hash.textContent = hash;
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

    onEntry(hash) {
        hash = decodeURIComponent(hash);

        let transaction = store.getState().transactions.entries.get(hash);
        if (!transaction) transaction = { hash };
        this.transaction = transaction;
        super.onEntry();
    }
}
