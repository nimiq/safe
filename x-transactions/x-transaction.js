import XElement from '/libraries/x-element/x-element.js';
import XIdenticon from '../x-identicon/x-identicon.js';
import XAddress from '../x-address/x-address.js';
import NanoApi from '/libraries/nano-api/nano-api.js';

export default class XTransaction extends XElement {
    html() {
        return `
            <x-identicon sender></x-identicon>
            <x-address sender></x-address>
            <x-identicon receiver></x-identicon>
            <x-address receiver></x-address>
            <span class="timestamp"></span>
            <span class="value"></span>
        `
    }
    children() { return [[XIdenticon], [XAddress]] }

    onCreate() {
        this.$senderIdenticon = this.$('x-identicon[sender]');
        this.$senderAddress = this.$('x-address[sender]');
        this.$receiverIdenticon = this.$('x-identicon[receiver]');
        this.$receiverAddress = this.$('x-address[receiver]');

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
        this.$senderAddress.address = address;
    }

    set receiver(address) {
        this.$receiverIdenticon.address = address;
        this.$receiverAddress.address = address;
    }

    set fee(fee) {
        this.$fee.textContent = this._formatBalance(fee);
    }

    set value(value) {
        this.$value.textContent = this._formatBalance(value);
    }

    set blockHeight(blockHeight) {
        this.$blockHeight.textContent = blockHeight;
    }

    set timestamp(timestamp) {
        this.$timestamp.textContent = timestamp;
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
