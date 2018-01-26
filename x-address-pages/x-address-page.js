import XElement from '/library/x-element/x-element.js';
import QrScanner from '/library/qr-scanner/qr-scanner.min.js';
import NanoApi from '/library/nano-api/nano-api.js';

export default class XAddressPage extends XElement {
    styles() { return ['x-address-page'] }

    onCreate() {
        this.$addressInput = this.$('x-address-input');
        this.$button = this.$('[enable-camera-button]');
        if(!this.$button) return;
        this.$button.addEventListener('click', () => this.fire('x-address-page-select', 'scanner'));
    }

    set active(active) {
        if (active) return;
        this.$addressInput.value = '';
    }
}