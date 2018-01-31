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
        this.$input.addEventListener('paste', async e => await this.__onPaste(e));
        PasteHandler.setDefaultTarget(this.$input);
        KeyboardHandler.setDefaultTarget(this.$input);
        this.oldInput = '';
    }

    _countSpaces(string) {
        return string.split('').filter(c => c === ' ').length;
    }

    _sanitize(input) {
        return input.toUpperCase()
            .replace(/I/g, '1')
            .replace(/O/g, '0')
            .replace(/Z/g, '2')
            .replace(/[^\w]|_| /g, '');
    }

    _addSpaces(input, offset) {
        const chars = input.split('');
        
        let withSpaces = '';
        chars.forEach((c,i) => {
            if ((i + offset) % 4 === 0) withSpaces += ' ';
            withSpaces += c;
        });

        return withSpaces;
    }

    async __onPaste(e) {
        // Cut off leading NQ if address has full length (otherwise it could be an NQNQ... address)
        let newValue = this._sanitize(this.$input.value);
        if (newValue.length === 36 && newValue.substr(0, 2) === 'NQ') {
            const cutoffNQ = newValue.substr(2, 42);
            newValue = this._addSpaces(cutoffNQ, 2);
        }
        this.value = newValue;
    }

    __onKeypress(e) {
        let cursorPosition = this.$input.selectionStart;

        let leftPart = this.$input.value.substr(0, cursorPosition);
        let rightPart = this.$input.value.substr(cursorPosition)

        leftPart = this._sanitize(leftPart);
        rightPart = this._sanitize(rightPart);

        if (e.keyCode === 13) return; // Enter

        if (e.keyCode === 8 || e.keyCode === 46) {
            // backspace / delete
            // if user deleted a space, delete char before / after instead
            const spacesOld = this._countSpaces(this.oldInput);
            const spacesBeforeSanitize = this._countSpaces(this.$input.value);
            const spaceWasJustDeleted = spacesBeforeSanitize === spacesOld - 1;
            if (spaceWasJustDeleted) {
                if (e.keyCode === 8) leftPart = leftPart.substr(0, cursorPosition - 1);
                if (e.keyCode === 46) rightPart = rightPart.substr(1);
            }
        }

        // Add space after 2,6,10,14 chars (leading nq not included)
        const offset = leftPart.length % 4 + 2;
        leftPart = this._addSpaces(leftPart, 2);
        rightPart = this._addSpaces(rightPart, offset);

        // merge again
        let newValue = leftPart + rightPart;
        cursorPosition = leftPart.length;
        
        // Cut off leading NQ if address has full length (otherwise it could be an NQNQ... address)
        let newValueNoSpaces = this._sanitize(newValue);
        if (newValueNoSpaces.length === 36 && newValueNoSpaces.substr(0, 2) === 'NQ') {
            const cutoffNQ = newValueNoSpaces.substr(2, 42);
            newValue = this._addSpaces(cutoffNQ, 2);
            cursorPosition -= 3;
        }

        this.value = newValue;
        CaretPosition.setCaretPosition(this.$input, cursorPosition);
        this.oldInput = this.$input.value;
    }
}

// Todo: [Max] [low] capture backspace when input value is marked
// Todo: [Max] Bug: Not accepted chars move the cursor to the right
// Todo: Only numbers for x-password-input
// Todo: Recactor NQ-pruning into value setter?
// Todo: [Max] Bug: @
// Todo: [Max] Bug: pasting when selected