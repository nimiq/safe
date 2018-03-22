import XElement from '/libraries/x-element/x-element.js';
import NanoApi from '/libraries/nano-api/nano-api.js';

export default class XAmount extends XElement {
    html(){
        return `
            <span class="dot-loader"></span>
            <x-currency-nim>
                <span class="integers"></span>.<span class="main-decimals"></span><span class="rest-decimals"></span> <span class="ticker">NIM</span>
            </x-currency-nim>
        `
    }

    onCreate() {
        if (this.attributes.white !== undefined) this.$('.dot-loader').classList.add('white');
        this.$integers = this.$('span.integers');
        this.$mainDecimals = this.$('span.main-decimals');
        this.$restDecimals = this.$('span.rest-decimals');
        this.$currencyNim = this.$('x-currency-nim');
    }

    set type(type) {
        this.$el.classList.add(type);
    }

    set value(value) {
        value = Number(value) || 0;
        value = Math.round(value * 100000) / 100000;

        const valueStr = value.toFixed(5);
        let [i, d] = valueStr.split('.');

        const integers = this._formatThousands(i);
        const mainDecimals = d.slice(0, 2);
        const restDecimals = d.slice(2);

        if (this.$('span.dot-loader')) this.$el.removeChild(this.$('span.dot-loader'));

        this.$integers.textContent = integers;
        this.$mainDecimals.textContent = mainDecimals;
        this.$restDecimals.textContent = restDecimals;
        this.$currencyNim.style.display = 'inline';
    }

    // _formatThousands(number, separator = '‘') {
    _formatThousands(number, separator = '\'') {
        let reversed = number.split('').reverse();
        for(let i = 3; i < reversed.length; i += 4) {
            reversed.splice(i, 0, separator);
        }
        return reversed.reverse().join('');
    }
}
