import MixinModal from '../mixin-modal/mixin-modal.js';
import XAddress from '../x-address/x-address.js';
import XTransaction from './x-transaction.js';
import MixinRedux from '../mixin-redux.js';
import { ValidationUtils } from '../../../node_modules/@nimiq/utils/dist/module/ValidationUtils.js';
import { CashlinkDirection } from '../../cashlink-redux.js';
import hubClient from '../../hub-client.js';
import BrowserDetection from '../../../node_modules/@nimiq/utils/dist/module/BrowserDetection.js';
import { Store } from '../../store.js';

export default class XTransactionModal extends MixinModal(XTransaction) {
    html() {
        return `
            <div class="modal-header">
                <i x-modal-close class="material-icons">close</i>
                <h2 class="title">
                    <span class="show-if-unclaimed">Unclaimed </span>
                    <span class="show-if-cashlink">Cashlink</span>
                    <span class="hide-if-cashlink">Transaction</span>
                </h2>
            </div>
            <div class="modal-body">
                <div class="center">
                    <x-identicon sender></x-identicon>
                    <i class="arrow material-icons">arrow_forward</i>
                    <x-identicon recipient></x-identicon>
                </div>

                <div class="center">
                    <div>
                        <x-amount></x-amount>
                        <button class="nq-button-s manage-cashlink display-none">Show Link</button>
                    </div>
                </div>

                <div class="row">
                    <label>From</label>
                    <div class="row-data">
                        <div class="label" sender></div>
                        <x-address sender></x-address>
                    </div>
                </div>

                <div class="recipient-section row">
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
                    <label class="hide-if-outgoing-cashlink">Date</label>
                    <label class="show-if-outgoing-cashlink">Created</label>
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

                <div class="cashlink-claimed-section display-none row">
                    <label>Claimed</label>
                    <div class="row-data">
                        <div class="timestamp-claimed" title="">pending...</div>
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

    listeners() {
        return {
            'click .manage-cashlink': this._manageCashlink,
        }
    }

    onCreate() {
        this.$senderAddress = this.$address[0];
        this.$recipientAddress = this.$address[1];
        this.$blockHeight = this.$('.blockHeight');
        this.$confirmations = this.$('.confirmations');
        this.$fee = this.$('.fee');
        this.$message = this.$('.extra-data');
        super.onCreate();

        this.$manageCashlink = this.$('.manage-cashlink');

        this._cashlink = undefined;
    }

    _onPropertiesChanged(changes) {
        const cashlinkAddress = this.properties.isCashlink === CashlinkDirection.FUNDING
            ? this.properties.recipient
            : this.properties.sender;
        this._cashlink = MixinRedux.store.getState().cashlinks.cashlinks.get(cashlinkAddress);

        super._onPropertiesChanged(changes);

        const isUnclaimedCashlink = !this.properties.pairedTx && this.properties.isCashlink === CashlinkDirection.FUNDING;
        this.$('.recipient-section').classList.toggle('display-none', isUnclaimedCashlink);

        if (!this._cashlink) {
            this.$manageCashlink.classList.add('display-none');
            return;
        }

        this.extraData = 'triggered'; // Doesn't really matter what is set here, as long as the setter is triggered

        const showLinkButton = this._cashlink.managed || BrowserDetection.isIOS() || BrowserDetection.isSafari();
        this.$manageCashlink.classList.toggle('display-none', !showLinkButton);
    }

    set sender(address) {
        super.sender = address;
        this.$senderAddress.address = address;
    }

    set recipient(address) {
        super.recipient = address;
        this.$recipientAddress.address = address;
    }

    set senderLabel(label) {
        super.senderLabel = label;
        this.$senderLabel.classList.toggle('default-label', label.startsWith('NQ'));
    }

    set recipientLabel(label) {
        this.$recipientLabels.forEach(e => {
            e.textContent = label;
            e.classList.toggle('default-label', label.startsWith('NQ'));
        });

        this.$el.classList.toggle('unclaimed', label === 'Unclaimed Cashlink');
    }

    set extraData(extraData) {
        if (this._cashlink) {
            if (this._cashlink.message) extraData = this._cashlink.message;
            else extraData = '';
        }
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

    set pairedTx(pairedTx) {
        if (pairedTx && this.properties.isCashlink === CashlinkDirection.FUNDING) {
            const time = moment.unix(pairedTx.timestamp);
            const $timestampClaimed = this.$('.timestamp-claimed');

            $timestampClaimed.textContent = `${time.toDate().toLocaleString()} (${time.fromNow()})`;
            this.$('.cashlink-claimed-section').classList.remove('display-none');
        } else {
            this.$('.cashlink-claimed-section').classList.add('display-none');
        }

        this.$('.recipient-section').classList.toggle(
            'display-none',
            !pairedTx && this.properties.isCashlink === CashlinkDirection.FUNDING,
        );
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

    _manageCashlink() {
        if (!this._cashlink) return;
        const address = this._cashlink.address;
        hubClient.manageCashlink(address);
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
        else transaction = Store.labelTransactions([transaction])[0];

        this.transaction = transaction;
    }
}
