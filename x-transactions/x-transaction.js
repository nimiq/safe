import XElement from '/libraries/x-element/x-element.js';
import XIdenticon from '../x-identicon/x-identicon.js';
import XAddress from '../x-address/x-address.js';
import NanoApi from '/libraries/nano-api/nano-api.js';

export default class XTransaction extends XElement {
    html() {
        return `
            <x-identicon sender></x-identicon>
            <span class="label" sender></span>
            <x-identicon recipient></x-identicon>
            <span class="label" recipient></span>
            <span class="timestamp" title="">pending...</span>
            <span class="value"></span>
        `
    }
    children() { return [XIdenticon] }

    onCreate() {
        this.$senderIdenticon = this.$identicon[0];
        this.$senderLabel = this.$('span.label[sender]');
        this.$recipientIdenticon = this.$identicon[1];
        this.$recipientLabel = this.$('span.label[recipient]');

        this.$timestamp = this.$('span.timestamp');
        this.$value = this.$('span.value');

        this.$el.addEventListener('click', e => this._onTransactionSelected());
    }

    _onPropertiesChanged(changes) {
        for (const prop in changes) {
            if (changes[prop] !== undefined) {
                // Update display
                this[prop] = changes[prop];
            }
        }
    }

    set sender(address) {
        this.$senderIdenticon.address = address;
    }

    set senderLabel(label) {
        this.$senderLabel.textContent = label;
    }

    set recipient(address) {
        this.$recipientIdenticon.address = address;
    }

    set recipientLabel(label) {
        this.$recipientLabel.textContent = label;
    }

    set value(value) {
        this.$value.textContent = this._formatBalance(value);
    }

    set fee(fee) {
        // this.$fee.textContent = this._formatBalance(fee);
    }

    set blockHeight(blockHeight) {
        // this.$blockHeight.textContent = blockHeight;
    }

    set timestamp(timestamp) {
        const time = moment.unix(timestamp);
        this.$timestamp.textContent = time.fromNow();
        this.$timestamp.setAttribute('title', time.toDate().toLocaleString());
    }

    set hash(hash) {
        this._hash = hash;
    }

    _onTransactionSelected() {
        //
    }

    _formatBalance(value) {
        return NanoApi.formatValue(value, 3) + ' NIM';
    }
}
