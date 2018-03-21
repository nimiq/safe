import MixinModal from '../mixin-modal/mixin-modal.js';
import XAddress from '../x-address/x-address.js';
import XToast from '../x-toast/x-toast.js';
import XTransaction from './x-transaction.js';

export default class XTransactionModal extends MixinModal(XTransaction) {
    html() {
        return `
            <div class="x-modal-header">
                <h2>Transaction Detail</h2>
            </div>
            <div class="x-modal-body">
                <x-identicon sender></x-identicon>
                <div class="label" sender></div>
                <x-address sender></x-address>
                <div>&#8674;</div>
                <x-identicon recipient></x-identicon>
                <div class="label" recipient></div>
                <x-address recipient></x-address>
                <div class="blockHeight"></div>
                <div class="timestamp" title="">pending...</div>
                <div class="value"></div>
                <div class="fee"></div>
                <div class="hash"></div>
            </div>
        `
    }

    children() { return super.children().concat([XAddress]) }

    onCreate() {
        super.onCreate();
        this.$senderAddress = this.$address[0];
        this.$recipientAddress = this.$address[1];
        this.$blockHeight = this.$('div.blockHeight');
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
        this.$fee.textContent = this._formatBalance(fee);
    }

    set blockHeight(blockHeight) {
        this.$blockHeight.textContent = `#${blockHeight}`;
    }

    set timestamp(timestamp) {
        const time = moment.unix(timestamp);
        this.$timestamp.textContent = `${time.toDate().toLocaleString()} (${time.fromNow()})`;
    }

    set hash(hash) {
        this._hash = hash;
        this.$hash.textContent = hash;
    }
}
