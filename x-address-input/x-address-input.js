import XInput from '../x-input/x-input.js';
import NanoApi from '/library/nano-api/nano-api.js';

export default class XAddressInput extends XInput {
    html() {
        return `
            <form action="/">
                <input type="text" placeholder="Enter Recipient Address" spellcheck="false" autocomplete="off">
            </form>
        `
    }

    styles() { return ['x-address'] }

    get _autosubmit() { return true; }

    _validate() {
        return NanoApi.validateAddress(this.value);
    }
}

// Todo auto-capitalize inputs