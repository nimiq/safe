import XInput from '../x-input/x-input.js';
import NanoApi from '/library/nano-api/nano-api.js';
import PasteHandler from '/library/nimiq-utils/paste-handler/paste-handler.js';
import KeyboardHandler from '/library/nimiq-utils/keyboard-handler/keyboard-handler.js';
import CaretPosition from '/library/nimiq-utils/caret-position/caret-position.js';

export default class XAddressInput extends XInput {
    html() {
        return `
            <form action="/">
                <span icon-person></span>
                <span class="prefix">nq</span>
                <input type="text" placeholder="Enter Recipient Address" spellcheck="false" autocomplete="off">
            </form>
        `
    }

    styles() { return ['x-address'] }

    get _autosubmit() { return true; }

    get value() { return 'NQ' + this.$input.value; }

    set value(input) { super.value = input; }

    _validate() {
        return NanoApi.validateAddress(this.value);
    }

    onCreate() {
        super.onCreate();
        const $input = this.$('input');
        PasteHandler.setDefaultTarget($input);
        KeyboardHandler.setDefaultTarget($input);
    }

    __onValueChanged() {
        let cursorPosition = this.$input.selectionStart;
        
        let sanitized = this.$input.value.toUpperCase()
            .replace(/I/g, '1')
            .replace(/O/g, '0')
            .replace(/Z/g, '2');

        sanitized = sanitized.replace(/[^\w]|_| /g, '');

        if (sanitized.length === 36 && sanitized.substr(0, 2) == 'NQ') {
            sanitized = sanitized.substr(2, 34);
            cursorPosition -= 2;
        }

        // const chars = sanitizedInput.split('');

        this.$input.value = sanitized;
        CaretPosition.setCaretPosition(this.$input, cursorPosition);
    }
}

// Todo: [Max] [low] automatically add white spaces after typing 4 chars (NQ52 R00E 3NKS DXH5 53U3 RK0V S7V4 LEH0 QV64)