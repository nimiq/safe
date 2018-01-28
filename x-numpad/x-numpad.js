import XElement from "/library/x-element/x-element.js";

export default class XNumpad extends XElement {
    html() {
        return `
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
            <span>6</span>
            <span>7</span>
            <span>8</span>
            <span>9</span>
            <span dot>.</span>
            <span>0</span>
            <span>&lt;</span>`
    }

    onCreate() {
        this._maxDecimals = 2;
        this.$dot = this.$('[dot]');
        this.addEventListener('click', e => this._onKeyPressed(e));
        this.clear();
    }

    clear() {
        this._integerDigits = '';
        this._decimalDigits = '';
        this._hasDot = false;
        this._onValueChanged();
    }

    get stringValue() {
        let string = this._integerDigits;
        if (this._hasDot) {
            string = string || '0';
            string += '.' + this._decimalDigits;
        }
        return string;
    }

    get value() {
        return parseFloat(this.stringValue);
    }

    set value(value) {
        if (value < 0) throw Error('Only non-negative numbers supported');
        if (value === this.value) return;
        const string = String(value);
        const parts = string.split('.');
        this._hasDot = parts.length > 1;
        this._integerDigits = parts[0];
        this._decimalDigits = this._hasDot? parts[1].substr(0, this._maxDecimals) : '';
        this._onValueChanged();
    }

    set maxDecimals(maxDecimals) {
        this._maxDecimals = maxDecimals;
        this._decimalDigits = this._decimalDigits.substr(0, maxDecimals);
    }

    _onKeyPressed(e) {
        const key = e.target;
        if (key === this.$el) return; // did not tap on a key but the numpad itself
        const keyValue = key.textContent;
        switch (keyValue) {
            case '<':
                this._remove();
                break;
            case '.':
                this._addDot();
                break;
            default:
                this._input(keyValue);
        }
        this._onValueChanged();
    }

    _input(digit) {
        if (!this._hasDot) {
            this._inputIntegerDigit(digit);
        } else if (this._decimalDigits.length < this._maxDecimals) {
            this._decimalDigits += digit;
        }
    }

    _inputIntegerDigit(digit) {
        if (this._integerDigits === '0') {
            // avoid leading zeros
            this._integerDigits = digit;
        } else {
            this._integerDigits += digit;
        }
    }

    _remove() {
        if (!this._hasDot) {
            this._integerDigits = this._removeLastDigit(this._integerDigits);
        } else {
            if (this._decimalDigits !== '') {
                this._decimalDigits = this._removeLastDigit(this._decimalDigits);
            } else {
                this._removeDot();
            }
        }
    }

    _removeLastDigit(digits) {
        return digits.substr(0, digits.length - 1);
    }

    _addDot() {
        this._hasDot = true;
        this.$dot.classList.add('hidden');
        if (this._integerDigits !== '') return;
        this._integerDigits = '0';
    }

    _removeDot() {
        this._hasDot = false;
        this.$dot.classList.remove('hidden');
    }

    _onValueChanged() {
        const stringValue = this.stringValue;
        this.fire('x-numpad-value', {
            value: parseFloat(stringValue) || 0,
            stringValue
        });
    }
}