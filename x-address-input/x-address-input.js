import XInput from '../x-input/x-input.js';
import NanoApi from '/library/nano-api/nano-api.js';
import PasteHandler from '/library/nimiq-utils/paste-handler/paste-handler.js';
import KeyboardHandler from '/library/nimiq-utils/keyboard-handler/keyboard-handler.js';

export default class XAddressInput extends XInput {
    html() {
        return `
            <form action="/">
                <a icon-paste></a>
                <span class="prefix">nq</span>
                <input type="text" placeholder="Enter Recipient Address" spellcheck="false" autocomplete="off">
            </form>
        `
    }

    styles() { return ['x-address'] }

    get _autosubmit() { return true; }

    _validate() {
        return NanoApi.validateAddress(this.value);
    }

    onCreate() {
        const $input = this.$('input');
        PasteHandler.setDefaultTarget($input, this._sanitize);
        KeyboardHandler.setDefaultTarget($input, this._sanitize);
    }

    _sanitize(input) {
        let sanitizedInput = input.toUpperCase()
                                    .replace(/I/g, '1')
                                    .replace(/O/g, '0')
                                    .replace(/Z/g, '2');

        if (sanitizedInput.length === 36 && sanitizedInput.substr(0,2) == 'NQ')
          sanitizedInput = sanitizedInput.substr(2, 34);

        sanitizedInput = sanitizedInput.replace(/[^\w]|_| /g, '');
        return sanitizedInput;
    }
}

// Todo: [Max] change paste icon (to material person?)
// Todo: [Max] fix mobile view of x-address-pages