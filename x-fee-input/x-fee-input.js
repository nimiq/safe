import XInput from '../../secure-elements/x-input/x-input.js';

export default class XFeeInput extends XInput {
    html() {
        return `
            <form>
                <div class="x-fee-labels">
                    <label free>free</label>
                    <label cheap>cheap</label>
                    <label fast>fast</label>
                </div>

                <input type="range" min="0" value="0">

                <div class="x-fee-value">
                    <span class="x-fee-sats">0</span> sat/byte:
                    <x-currency-nim>0.00</x-currency-nim> NIM
                    <x-currency-fiat>($0.00)</x-currency-fiat>
                </div>
            </form>`;
    }

    onCreate() {
        super.onCreate();
        this.$sats = this.$('.x-fee-sats');
        this.$nim = this.$('x-currency-nim');
        this.$fiat = this.$('x-currency-fiat');
        this._previousValue = '';
        this._maxSats = this.attributes.maxSats || 2;
        this.txSize = 138; // BasicTransaction, bytes
    }

    listeners() {
        return {
            'click label[free]': () => this._clickedLabel('free'),
            'click label[cheap]': () => this._clickedLabel('cheap'),
            'click label[fast]': () => this._clickedLabel('fast'),
        }
    }

    set value(value) {
        super.value = Number(value || 0); // triggers _onValueChanged
    }

    get value() {
        return Number(this.$input.value);
    }

    set txSize(size) {
        const step = this.value / this._txSize;
        this._txSize = size;
        this.$input.setAttribute('max', this._txSize * this._maxSats / 1e5);
        this.$input.setAttribute('step', this._txSize / 1e5);
        this.value = step * this._txSize;
    }

    /** @overwrites */
    _onValueChanged() {
        if (!this._validate()) {
            this.value = this._previousValue;
            return;
        }
        this._previousValue = this.value;
        //this._currencyFiat = this.value;

        this.$sats.textContent = Math.round(this.value * 1e5 / this._txSize);
        this.$nim.textContent = this.value;
        // this._currencyFiat(this.value);

        this.fire('x-fee-input-changed', this.value);
    }

    _clickedLabel(type) {
        switch(type) {
            case 'free':
                this.value = 0;
                break;
            case 'cheap':
                this.value = Math.floor(this._maxSats * this._txSize / 2 / this._txSize) * this._txSize / 1e5;
                break;
            case 'fast':
                this.value = this._maxSats * this._txSize;
                break;
        }
    }

    /*
    set _currencyFiat(value) {
        this.$fiat.textContent = NanoApi.formatValueInDollar(value);
    }
    */
}
