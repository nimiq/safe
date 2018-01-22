import XElement from "/library/x-element/x-element.js";

export default class XNumpad extends XElement {
    html() {
        return `
            <button>1</button>
            <button>2</button>
            <button>3</button>
            <button>4</button>
            <button>5</button>
            <button>6</button>
            <button>7</button>
            <button>8</button>
            <button>9</button>
            <button>.</button>
            <button>0</button>
            <button>&lt;</button>`
    }

    onCreate() {
        this.addEventListener('click', e => this._handleKey(e.target.textContent));
    }

    _handleKey(key) {
        console.log(key);
        switch (key) {
            case '<':
                this._remove();
                return;
            case '.':
                this._dot();
                return;
            default:
                this._add(Number(key));
        }

    }

    _add(digit) {
        if (this._decimalIndex) {
            this.value = this.value + digit / this._decimalIndex;
            this._decimalIndex *= 10;
        } else {
            this.value = this.value * 10 + digit;
        }
    }

    _remove() {
        if (this._decimalIndex) {
            this._decimalIndex /= 10;
            if (this._decimalIndex == 10) this._removeDot();
            else this.value = Math.floor(this.value * (this._decimalIndex / 10)) / (this._decimalIndex / 10);
        } else {
            this.value = Math.floor(this.value / 10);
        }
    }

    _dot() {
        this._decimalIndex = 10;
    }

    _removeDot() {
        this._decimalIndex = 0;
        this.value = Math.round(this.value);
    }

    get value() {
        return this._value || 0;
    }

    set value(value) {
        this._value = value;
        this.fire('x-change', value);
    }
}

// Todo: Fix bugs when entering 0.123 and deleting