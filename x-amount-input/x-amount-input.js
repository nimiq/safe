import XInput from '../../secure-elements/x-input/x-input.js';
import XNumpad from '../x-numpad/x-numpad.js';

export default class XAmountInput extends XInput {
    html() {
        return `
            <form>
                <x-currency-1>
                    <input placeholder="0.00" type="number" min="0">
                </x-currency-1>
                <x-currency-2></x-currency-2>
            </form>
            <x-numpad></x-numpad>`;
    }

    children() { return [XNumpad] }

    onCreate() {
        super.onCreate();
        this.$currency2 = this.$('x-currency-2');
        this._previousValue = '';
        this.maxDecimals = this.attributes.maxDecimals ? parseInt(this.attributes.maxDecimals) : 2;
        if (!this._isMobile || this.$el.hasAttribute('no-screen-keyboard')) {
            this.$numpad.$el.style.display = 'none';
            return;
        }
        this._initScreenKeyboard();
    }

    set value(value) {
        if (value === '') {
            super.value = '';
            return;
        }
        value = Number(value);
        const decimals = Math.pow(10, this.maxDecimals);
        super.value = Math.round(value * decimals) / decimals; // triggers _onValueChanged
    }

    get value() {
        return Number(this.$input.value);
    }

    set maxDecimals(maxDecimals) {
        this._maxDecimals = maxDecimals;
        this.$numpad.maxDecimals = maxDecimals;
        this.$input.step = 1 / Math.pow(10, maxDecimals); /* also has an influence on this._validate() */
    }

    get maxDecimals() {
        return this._maxDecimals;
    }

    _initScreenKeyboard() {
        this.$input.setAttribute('disabled', '1');
        this.$input.setAttribute('type', 'text'); // to be able to set the string "0."
        this.$numpad.addEventListener('x-numpad-value', e => this._onNumpadValue(e));
    }

    /** @overwrites */
    _onValueChanged() {
        if (!this._validate()) {
            this.value = this._previousValue;
            return;
        }
        this._previousValue = this.value;
        //this._currency2 = this.value;
        if (this.$input.value === '') {
            this.$numpad.clear();
        } else {
            this.$numpad.value = this.value;
        }
    }

    /*
    set _currency2(value) {
        if (value === 0) {
            this.$currency2.textContent = '';
        } else {
            this.$currency2.textContent = NanoApi.formatValueInDollar(value);
        }
    }
    */

    get _isMobile() {
        return window.innerWidth < 420;
    }

    focus() {
        if (this.$input.hasAttribute('disabled')) return;
        super.focus();
    }

    _onNumpadValue(event) {
        super.value = event.detail.stringValue; // also triggers _onValueChanged
    }
}

// Todo: [low] [Max] refactor `_isMobile` into an own library for mobile-detection
    // then make it more sophisticated (regex ?)
