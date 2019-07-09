import MixinModal from '../mixin-modal/mixin-modal.js';
import XAddress from '../x-address/x-address.js';
import XTransaction from './x-transaction.js';
import MixinRedux from '../mixin-redux.js';
import { ValidationUtils } from '../../../node_modules/@nimiq/utils/dist/module/ValidationUtils.js';

export default class XTransactionModal extends MixinModal(XTransaction) {
    html() {
        return `
            <div class="modal-header">
                <i x-modal-close class="material-icons">close</i>
                <h2 class="title">Transaction</h2>
            </div>
            <div class="modal-body">
                <div class="center">
                    <x-identicon sender></x-identicon>
                    <i class="arrow material-icons" tx-icon>arrow_forward</i>
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
        this.$blockHeight = this.$('.blockHeight');
        this.$confirmations = this.$('.confirmations');
        this.$fee = this.$('.fee');
        this.$message = this.$('.extra-data');
        this.$title = this.$('.title');
        super.onCreate();
    }

    set sender(address) {
        if (this.properties.isCashlink === 'claiming' && !this.properties.pairedTx) {
            this.$senderIdenticon.address = 'cashlink';
        } else {
            this.$senderIdenticon.address = address;
        }

        this.$senderAddress.address = address;
    }

    set recipient(address) {
        if (this.properties.isCashlink === 'funding' && !this.properties.pairedTx) {
            this.$recipientIdenticons.forEach(e => e.address = 'cashlink');
        } else {
            this.$recipientIdenticons.forEach(e => e.address = address);
        }

        this.$recipientAddress.address = address;
    }

    set senderLabel(label) {
        this.$senderLabel.textContent = label;
        this.$senderLabel.classList.toggle('default-label', label.startsWith('NQ'));
    }

    set recipientLabel(label) {
        this.$recipientLabels.forEach(e => {
            e.textContent = label;
            e.classList.toggle('default-label', label.startsWith('NQ'));
        });
    }

    set isCashlink(value) {
        this.$title.textContent = !!value ? 'Cashlink' : 'Transaction';
        this.$el.classList.toggle('cashlink', !!value);
    }

    set extraData(extraData) {
        this.$('.extra-data-section').classList.toggle('display-none', !extraData);
        this.$message.textContent = extraData;
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
        if (!transaction)
            transaction = { hash };
        this.transaction = transaction;
    }
}
