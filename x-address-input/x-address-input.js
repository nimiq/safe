import XInput from '../../secure-elements/x-input/x-input.js';
import ValidationUtils from '/libraries/secure-utils/validation-utils/validation-utils.js';
import PasteHandler from '/libraries/nimiq-utils/paste-handler/paste-handler.js';
import KeyboardHandler from '/libraries/secure-utils/keyboard-handler/keyboard-handler.js';
import InputFormat from '/libraries/nimiq-utils/input-format/index.js';
import XIdenticon from '../../secure-elements/x-identicon/x-identicon.js';


export default class XAddressInput extends XInput {
    html() {
        return `
            <div class="input-row">
                <x-identicon></x-identicon>
            </div>
            <div class="input-row">
                <span class="prefix">NQ</span>
                <form action="/">
                    <input type="text" placeholder="Enter Recipient Address" spellcheck="false" autocomplete="off">
                </form>
            </div>
        `
    }

    onCreate() {
        super.onCreate();
        const onChange = () => this._autoSubmit?  this._submit() : this._validate();
        this.$input.addEventListener('paste', e => InputFormat.onPaste(e, this.$input, this._parseAddressChars, this._format, onChange));
        this.$input.addEventListener('cut', e => InputFormat.onCut(e, this.$input, this._parseAddressChars, this._format, onChange));
        this.$input.addEventListener('keydown', e => InputFormat.onKeyDown(e, this.$input, this._parseAddressChars, this._format, onChange));
        // input event will be handled by _onValueChanged
        this.$el.addEventListener('click', () => this.$input.focus());
    }

    styles() { return ['x-address']; }

    children() { return [XIdenticon]; }

    get value() {
        const address = 'NQ' + this.$input.value;
        return ValidationUtils.isValidAddress(address)? address : null;
    }

    set value(value) {
        // Have to define setter as we have defined the getter as well, but we'll just call the setter of super.
        // This will also trigger _onValueChanged
        super.value = value;
    }

    _onValueChanged() {
        InputFormat.onChange(null, this.$input, this._parseAddressChars, this._format,
            () => this._autoSubmit? this._submit() : this._validate());
        this.$identicon.address = this.value;
    }

    _validate() {
        return this.value !== null;
    }

    set placeholderColor(color) {
        this.$identicon.placeholderColor = color;
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
        const template = 'xx xxxx xxxx xxxx xxxx xxxx xxxx xxxx xxxx';
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
