import XInput from '../x-input/x-input.js';
import NanoApi from '/library/nano-api/nano-api.js';
import XNumpad from '../x-numpad/x-numpad.js';

export default class XAmountInput extends XInput {
    html() {
        return `
            <form>
                <x-currency-1>
                    <input placeholder="00.00" type="number">
                </x-currency-1>
                <x-currency-2></x-currency-2>
            </form>
            <x-numpad></x-numpad>
            `;
    }

    children() { return [XNumpad] }

    onCreate() {
        super.onCreate();
        this.$currency2 = this.$('x-currency-2');
        if (!this._isMobile) return;
        this._initScreenKeyboard();
    }

    set value(value) {
        super.value = NanoApi.formatValue(value);
        this._currency2 = value;
    }

    get value() {
        return Number(this.$input.value);
    }

    _onValueChanged() {
        this._currency2 = this.value;
        this.$numpad.value = this.value;
    }

    _validate() {
        return this.value > 0; 
    }

    set _currency2(value) {
        this.$currency2.textContent = NanoApi.formatValueInDollar(value);
    }

    get _isMobile() {
        return window.innerWidth < 420; 
    }

    focus() {
        if (this._isMobile) return;
        super.focus();
    }

    _initScreenKeyboard() {
        this.$input.setAttribute('disabled', '1');
        this.$numpad.addEventListener('x-numpad-value', e => this._onNumpadValue(e.detail));
    }

    _onNumpadValue(value) {
        this.value = value;
        this._onValueChanged();
    }
}

// Todo: validate if value is <= balance 
// Todo: refactor `_isMobile` into an own library for mobile-detection and make it more sophisticated (regex ?)