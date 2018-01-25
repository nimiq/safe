import XElement from "/library/x-element/x-element.js";

export default class XNumpad extends XElement {
    html() {
        return `
            <x-numpad-key>1</x-numpad-key>
            <x-numpad-key>2</x-numpad-key>
            <x-numpad-key>3</x-numpad-key>
            <x-numpad-key>4</x-numpad-key>
            <x-numpad-key>5</x-numpad-key>
            <x-numpad-key>6</x-numpad-key>
            <x-numpad-key>7</x-numpad-key>
            <x-numpad-key>8</x-numpad-key>
            <x-numpad-key>9</x-numpad-key>
            <x-numpad-key>.</x-numpad-key>
            <x-numpad-key>0</x-numpad-key>
            <x-numpad-key>&lt;</x-numpad-key>`
    }

    onCreate() {
        this.addEventListener('click', e => this._onKeyPressed(e));
    }

    _onKeyPressed(e) {
        const key = e.target.textContent;
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
        if (this._value === value) return;
        this._value = value;
        this.fire('x-numpad-value', value);
    }
}

// Todo: Fix bugs when entering 0.123 and deleting