import XInput from '../x-input/x-input.js';
import NanoApi from '/library/nano-api/nano-api.js';
import PasteHandler from '/library/nimiq-utils/paste-handler/paste-handler.js';
import KeyboardHandler from '/library/nimiq-utils/keyboard-handler/keyboard-handler.js';
import * as InputFormat from '/library/nimiq-utils/input-format/index.js'
import { onChange } from '../../library/nimiq-utils/input-format/source/input-control.js';


export default class XAddressInput extends XInput {
    html() {
        return `
            <form action="/">
                <span icon-person></span>
                <input type="text" placeholder="Enter Recipient Address" spellcheck="false" autocomplete="off">
                <span class="prefix">nq</span>
            </form>
        `
    }

    styles() { return ['x-address'] }

    get _autosubmit() { return true; }

    get value() { return 'NQ' + this.$input.value; }

    set value(value) { this.$input.value = value; }

    _validate() {
        return NanoApi.validateAddress(this.value);
    }

    onCreate() {
        super.onCreate();
        const onChange = e => { this._submit(); };
        this.$input.addEventListener('paste', e => InputFormat.onPaste(e, this.$input, this._parseAddressChars, this._format, onChange));
        this.$input.addEventListener('cut', e => InputFormat.onCut(e, this.$input, this._parseAddressChars, this._format, onChange));
        this.$input.addEventListener('input', e => InputFormat.onChange(e, this.$input, this._parseAddressChars, this._format, onChange));
        this.$input.addEventListener('keydown', e => InputFormat.onKeyDown(e, this.$input, this._parseAddressChars, this._format, onChange));
        this.oldInput = '';
    }

    _onEntry() {
        PasteHandler.setDefaultTarget(this.$input);
        KeyboardHandler.setDefaultTarget(this.$input);
    }

    _format(address) {
        let value = address;
        // remove leading NQ
        if (address.substr(0, 2) === 'NQ') {
            value = address.substr(2);
        }
        const template = 'xx xxxx xxxx xxxx xxxx xxxx xxxx xxxx xxxx xxxx';
        return InputFormat.templateFormatter(template)(value);
    }
   
    // Accept 0-9, a-Z. Convert to upper case and replace some letters by similar looking numbers.
    _parseAddressChars(character, value) {
        const prunedCharacter = character.toUpperCase()
            .replace('I', '1')
            .replace('O', '0')
            .replace('Z', '2')
            .replace(/[^\w]|_| /, '');

        if (prunedCharacter !== '') {
            return prunedCharacter;
        }
    }
}