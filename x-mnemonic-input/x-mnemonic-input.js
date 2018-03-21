import XElement from '/libraries/x-element/x-element.js';
import MnemonicPhrase from '/libraries/mnemonic-phrase/mnemonic-phrase.min.js';
import XSuccessMark from '../x-success-mark/x-success-mark.js';
import XMnemonicInputField from './x-mnemonic-input-field.js';

export default class XMnemonicInput extends XElement {
    html() {
        return `
            <form autocomplete="off"></form>
            <x-mnemonic-input-success>
                <x-success-mark></x-success-mark>
                <h2>Account Recovered</h2>
            <x-mnemonic-input-success>`;
    }

    children() { return [XSuccessMark] }

    styles() { return ['x-recovery-phrase'] }

    onCreate() {
        this.$fields = [];
        this.$form = this.$('form');
        for (let i = 0; i < 24; i++) this._createField(i);
        this._datalistSupport = this._hasDatalistSupport();
        if (this._datalistSupport) this._createDatalist();
        else this.$fields.forEach(field => field.setupAutocomplete());
        this.addEventListener('x-mnemonic-input-field-valid', e => this._onFieldComplete(e));
        this._mnemonic = '';
    }

    _createField(index) {
        const field = XMnemonicInputField.createElement();
        // field.$el.style.animationDelay = (700 + 60 * index) + 'ms';
        field.$input.placeholder = 'word #' + (index + 1);
        this.$form.appendChild(field.$el);
        this.$fields.push(field);
    }

    _hasDatalistSupport() {
        return !!('list' in document.createElement('input'))
            && !!(document.createElement('datalist') && window.HTMLDataListElement);
    }

    _createDatalist() {
        const datalist = document.createElement('datalist');
        datalist.setAttribute('id', 'x-mnemonic-wordlist');
        MnemonicPhrase.DEFAULT_WORDLIST.forEach(word => {
            const option = document.createElement('option');
            option.textContent = word;
            datalist.appendChild(option);
        });
        this.$el.appendChild(datalist);
    }

    _onFieldComplete(e) {
        const isValid = e.detail || false;
        if(!isValid) return;

        const el = e.target;
        setTimeout(_ => {
            // Test if the element that fired the event is still the focused element
            if (el.querySelector('input') === document.activeElement) {
                // Find active field
                const field = this.$fields.find(field => field.$el === el);
                const index = Array.prototype.indexOf.call(this.$fields, field);
                if (index < this.$fields.length - 1)
                    // Set focus to next field
                    this.$fields[index + 1].focus();
                else this.$fields[index].$input.blur();
            }

            this._checkPhraseComplete();
        }, this._datalistSupport ? 0 : 40);
    }

    _checkPhraseComplete() {
        const check = this.$fields.find(field => !field.complete);
        if (typeof check !== 'undefined') return;
        const mnemonic = this.$fields.map(field => field.$input.value).join(' ');
        try {
            const privateKey = MnemonicPhrase.mnemonicToKey(mnemonic);
            this.fire(this.__tagName, privateKey);
            this._animateSuccess();
        } catch (e) {
            console.log(e.message);
            this._animateError();
        }
    }

    _animateSuccess() {
        this.$el.classList.add('recovered');
        setTimeout(() => this.$successMark.animate(), 300);
    }

    _animateError() {
        this.animate('shake');
    }

    focus() {
        this.$fields[0].$input.focus();
    }

    animateEntry() {
        this.$el.classList.add('x-entry');
        setTimeout(() => {
            this.focus();
            this.$el.classList.remove('x-entry')
        }, 3000);
    }
}
