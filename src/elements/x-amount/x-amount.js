import XElement from '../../lib/x-element/x-element.js';
import Config from '../../lib/config.js';
import { TransactionType } from '../../selectors/transaction$.js';

export default class XAmount extends XElement {
    html(){
        return `
            <label class="display-none mobile-hidden"></label>
            <span class="dot-loader"></span>
            <x-currency-nim>
                <span class="integers"></span>.<span class="main-decimals"></span><span class="rest-decimals"></span> <span class="ticker">NIM</span>
            </x-currency-nim>
        `
    }

    onCreate() {
        if (Config.offline) {
            this.$el.removeChild(this.$('span.dot-loader'));
            this.$el.classList.add('display-none');
            return;
        }

        if (this.attributes.white !== undefined) this.$('.dot-loader').classList.add('white');
        this.$label = this.$('label');
        if (this.attributes.label !== undefined) {
            this.label = this.attributes.label;
        }
        this.$integers = this.$('span.integers');
        this.$mainDecimals = this.$('span.main-decimals');
        this.$restDecimals = this.$('span.rest-decimals');
        this.$currencyNim = this.$('x-currency-nim');
        this._value = 0;
    }

    set type(type) {
        this.$el.classList.remove.apply(this.$el.classList, Object.values(TransactionType));
        type && this.$el.classList.add(type);
    }

    set value(value) {
        if (Config.offline) return;

        value = Number(value) || 0;
        value = Math.round(value * 100000) / 100000;

        this._value = value;

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

    set label(label) {
        this.$label.textContent = label;
        this.$label.classList.remove('display-none');
    }

    get value() {
        return this._value;
    }

    // _formatThousands(number, separator = '\u202F') { // Thin no-breaking space
    _formatThousands(number, separator = '\u00A0') { // Regular no-breaking space
        let reversed = number.split('').reverse();
        for(let i = 3; i < reversed.length; i += 4) {
            reversed.splice(i, 0, separator);
        }
        return reversed.reverse().join('');
    }
}
