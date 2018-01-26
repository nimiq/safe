import XAddressPage from "./x-address-page.js";
import XAddressInput from "../x-address-input/x-address-input.js";
import XAddressFileInput from '../x-address-file-input/x-address-file-input.js';

export default class XAddressFallbackPage extends XAddressPage {
    html() {
        return `
            <h1>Transaction Recipient</h1>
            <h2>First enter the recipient's address to send funds</h2>
            <x-grow class="center">
                <x-address-input></x-address-input>
            </x-grow>
            <a secondary enable-camera-button>Use the scanner</a>
            <x-address-file-input secondary>Scan from image</x-address-file-input>
            `;
    }

    children() { return [XAddressInput, XAddressFileInput] }
}