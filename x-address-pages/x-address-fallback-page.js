import XElement from '/library/x-element/x-element.js';
import XAddressInput from "../x-address-input/x-address-input.js";
import XAddressFileInput from '../x-address-file-input/x-address-file-input.js';

export default class XAddressFallbackPage extends XElement {
    html() {
        return `
            <h1>Transaction Recipient</h1>
            <h2>First enter the recipient's address to send funds</h2>
            <x-grow class="center">
                <x-address-input></x-address-input>
            </x-grow>
            <a secondary use-camera>Use the scanner</a>
            <x-address-file-input secondary>Scan from image</x-address-file-input>
            `;
    }

    children() { return [XAddressInput, XAddressFileInput] }

    onCreate() {
        this.$('[use-camera]').addEventListener('click', e => this.fire('x-address-page-select', 'scanner'));
    }
}