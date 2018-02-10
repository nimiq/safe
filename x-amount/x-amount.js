import XElement from '/libraries/x-element/x-element.js';
import NanoApi from '/libraries/nano-api/nano-api.js';

export default class XAmount extends XElement {
    html(){
        return `
            <x-currency-1></x-currency-1>
            <x-currency-2></x-currency-2>`
    }

    onCreate(){
        this.$currency1 = this.$('x-currency-1')
        this.$currency2 = this.$('x-currency-2')
    }

    set value(value) {
        value = Number(value);
        this.$currency1.textContent = NanoApi.formatValue(value, 3) || '';
        this.$currency2.textContent = NanoApi.formatValueInDollar(value) || '';
    }
}
