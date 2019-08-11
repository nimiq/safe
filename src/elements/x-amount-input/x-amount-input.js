import XInput from '../x-input/x-input.js';

export default class XAmountInput extends XInput {
    html() {
        return `
            <form>
                <x-currency-nim>
                    <input class="nq-input" placeholder="0.00" type="number" min="0">
                    <span class="ticker">NIM</span>
                    <button class="small secondary set-max">Max</button>
                </x-currency-nim>
                <x-currency-fiat></x-currency-fiat>
            </form>`;
    }

    onCreate() {
        super.onCreate();
        this.$currency2 = this.$('x-currency-2');
        this._previousValue = '';
        this.maxDecimals = this.attributes.maxDecimals ? parseInt(this.attributes.maxDecimals) : 5;
    }

    listeners() {
        return {
            'click button.set-max': this._onClickSetMax,
            'focus input': this._toggleMaxButton,
            'blur input': this._onBlur
        }
    }

    set value(value) {
        if (value === '' || value > 21e10) {
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
        this.$input.step = 1 / Math.pow(10, maxDecimals); /* also has an influence on this._validate() */
    }

    get maxDecimals() {
        return this._maxDecimals;
    }

    /** @overwrites */
    _onValueChanged() {
        if (!this._validate()) {
            this.value = this._previousValue;
            return;
        }
        this._previousValue = this.value;
        this._toggleMaxButton();
    }

    _validate() {
        if (!super._validate()) return false;
        if (this.value > 0 && this.value < 1e-5) return false;
        return true;
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

    focus() {
        if (this.$input.hasAttribute('disabled')) return;
        super.focus();
    }

    _onClickSetMax(_, e) {
        e.preventDefault();
        this.fire('x-amount-input-set-max');
    }

    _toggleMaxButton() {
        this.$el.classList.toggle('show-set-max-button', !this.$input.value);
    }

    _onBlur() {
        this.$el.classList.remove('show-set-max-button');
    }
}
