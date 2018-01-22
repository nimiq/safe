import XAmount from './x-amount.js';

class XAmountInput extends XAmount {
    html(){
        return `
            <x-currency-1>
                <input placeholder="00.00" type="number">
            </x-currency-1>
            <x-currency-2></x-currency-2>`
    }

    onCreate() {
        this.$input = this.$('input');
        this.$input.addEventListener('change', e => this._valueChanged());
        this.$input.addEventListener('keyup', e => this._valueChanged(e));
        if (window.innerWidth > 420) return;
        this.$input.setAttribute('disabled', '1');
    }

    _valueChanged(e) {
        if (e && e.keyCode === 13) return this.fire('x-enter');
        this.value = this.$input.value;
    }

    set _currency1(value) {
        this.$input.value = value || '';
        this.fire('x-change', value);
    }

    focus() {
        if (window.innerWidth < 420) return;
        requestAnimationFrame(_ => this.$input.focus());
    }

    set value(value) {
        super.value = value;
    }

    get value() {
        return this.$input.value;
    }
}