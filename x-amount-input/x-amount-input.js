import XInput from '../x-input/x-input.js';
import NanoApi from '/library/nano-api/nano-api.js';
export default class XAmountInput extends XInput {
    html() {
        return `
            <form>
                <x-currency-1>
                    <input placeholder="00.00" type="number">
                </x-currency-1>
                <x-currency-2></x-currency-2>
            </form>`;
    }

    onCreate() {
        super.onCreate();
        this.$currency2 = this.$('x-currency-2');
        if (!this._suppressKeyboard) return;
        this.$input.setAttribute('disabled', '1');
    }

    _onValueChanged(e) {
        this._currency2 = this.value;
    }

    set _currency2(value) {
        this.$currency2.textContent = NanoApi.formatValueInDollar(value);
    }

    get _suppressKeyboard() {
        return window.innerWidth < 420; // Todo: refactor this into a library for mobile-detection
    }

    _validate() {
        return this.value > 0;    // Todo: validate if value is correct 
    }

    focus() {
        if (this._suppressKeyboard) return;
        super.focus();
    }

    set value(value) {
        super.value = NanoApi.formatValue(value)
        this._currency2 = value;
    }
    
    get value() { 
        return Number(this.$input.value);
    }
}