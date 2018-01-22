import XElement from '/library/x-element/x-element.js';

export default class XAmount extends XElement {
    html(){
        return `
            <x-currency-1></x-currency-1>
            <x-currency-2></x-currency-2>`
    }

    set value(value) {
        value = Number(value);
        this._currency1 = XAmount.format(value, 3);
        this._currency2 = XAmount.format(value * 17.1, 2);
    }

    set _currency1(value) {
        this.$('x-currency-1').textContent = value;
    }

    set _currency2(value) {
        this.$('x-currency-2').textContent = value;
    }

    static format(number, decimals = 3) {
        decimals = Math.pow(10, decimals);
        return Math.round(number * decimals) / decimals;
    }
}
