import XInput from '../x-input/x-input';
import XNumpad from '../x-numpad/x-numpad.js';

export default class XAmountInput extends XInput {
    private _maxDecimals!: number;
    private $numpad: any;
    private _previousValue!: string | number;

    public set value(value: number | string) {
        if (value === '' || value > 21e10) {
            super.value = '';
            return;
        }
        value = Number(value);

        const decimals = Math.pow(10, this.maxDecimals);
        super.value = Math.round(value * decimals) / decimals; // triggers _onValueChanged
    }

    public get value() {
        return Number(this.$input.value);
    }

    public set maxDecimals(maxDecimals: number) {
        this._maxDecimals = maxDecimals;
        this.$numpad.maxDecimals = maxDecimals;
        this.$input.step = (1 / Math.pow(10, maxDecimals)).toString(); /* also has an influence on this._validate() */
    }

    public get maxDecimals() {
        return this._maxDecimals;
    }

    public focus() {
        if (this.$input.hasAttribute('disabled')) return;
        super.focus();
    }

    protected html() {
        return `
            <form>
                <x-currency-nim>
                    <input placeholder="0.00" type="number" min="0">
                    <span class="ticker">NIM</span>
                    <button class="small secondary set-max">Max</button>
                </x-currency-nim>
                <x-currency-fiat></x-currency-fiat>
            </form>
            <x-numpad></x-numpad>`;
    }

    protected children() { return [XNumpad]; }

    protected onCreate() {
        super.onCreate();
        this._previousValue = '';
        this.maxDecimals = this.attributes.maxDecimals ? parseInt(this.attributes.maxDecimals, 10) : 5;
        if (!this._isMobile || this.$el.hasAttribute('no-screen-keyboard')) {
            this.$numpad.$el.style.display = 'none';
            return;
        }
        this._initScreenKeyboard();
    }

    protected listeners() {
        return {
            'click button.set-max': this._onClickSetMax,
            'focus input': this._toggleMaxButton,
            'blur input': this._onBlur,
        };
    }

    /** @overwrites */
    protected _onValueChanged() {
        if (!this._validate()) {
            this.value = this._previousValue;
            return;
        }
        this._previousValue = this.value;
        if (this.$input.value === '') {
            this.$numpad.clear();
        } else {
            this.$numpad.value = this.value;
        }
        this._toggleMaxButton();
    }

    private _initScreenKeyboard() {
        this.$input.setAttribute('disabled', '1');
        this.$input.setAttribute('type', 'text'); // to be able to set the string "0."
        this.$numpad.addEventListener('x-numpad-value', (e: CustomEvent) => this._onNumpadValue(e));
    }

    private get _isMobile() {
        return window.innerWidth < 420;
    }

    private _onNumpadValue(event: CustomEvent) {
        super.value = event.detail.stringValue; // also triggers _onValueChanged
    }

    private _onClickSetMax(_: any, e: Event) {
        e.preventDefault();
        this.fire('x-amount-input-set-max');
    }

    private _toggleMaxButton() {
        this.$el.classList.toggle('show-set-max-button', !this.$input.value);
    }

    private _onBlur() {
        this.$el.classList.remove('show-set-max-button');
    }
}
