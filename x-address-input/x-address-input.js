import XInput from '../x-input/x-input.js';
import NanoApi from '/library/nano-api/nano-api.js';

export default class XAddressInput extends XInput {
    html() {
        return `
            <form action="/">
                <a icon-paste></a>
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

// Todo: [Daniel] auto-capitalize inputs
// Todo: [Daniel] Assist users who type instead of paste the address:
    // 1. Error if value doesn't start with NQ
    // 2. Error if char not in range 
    // ... 