import XInput from '../x-input/x-input.js';
import AutoComplete from './auto-complete.js';
import MnemonicPhrase from '/libraries/mnemonic-phrase/mnemonic-phrase.min.js';

export default class XMnemonicInputField extends XInput {

    html() {
        return `<input type="text" autocorrect="off" autocapitalize="none" spellcheck="false">`;
    }

    styles() { return ['x-input'] }

    listeners() {
        return {
            'keydown input': (_, e) => this.__onValueChanged(e),
            'blur input': (_, e) => this.__onValueChanged(e),
            [`${this.__tagName}-valid`]: (detail) => this._onValidEvent(detail)
        }
    }

    __onValueChanged(e) {
        if (!['keydown', 'input', 'blur'].includes(e.type)) return;
        if (e.keyCode === 32 /* space */ ) e.preventDefault();
        const triggerKeyCodes = [32 /* space */, 9 /* tab */, 13 /* enter */];
        if (triggerKeyCodes.includes(e.keyCode) || e.type === 'blur' || (e.type === 'input' && typeof e.data === 'undefined')) {
            if (this.value.length >= 3) this._notifyValidity();
        }
        this._onValueChanged();
    }

    setupAutocomplete() {
        this.autocomplete = new AutoComplete({
            selector: this.$input,
            source: (term, response) => {
                term = term.toLowerCase();
                const list = MnemonicPhrase.DEFAULT_WORDLIST.filter(word => {
                    return word.slice(0, term.length) === term;
                });
                response(list);
            },
            minChars: 3,
            delay: 0
        });
    }

    _validate(value) {
        const index = MnemonicPhrase.DEFAULT_WORDLIST.indexOf(value.toLowerCase());
        return index > -1;
    }

    _onValidEvent(isValid) {
        this.complete = isValid;
        if(isValid) this.$el.classList.add('complete');
        else this._onInvalid();
    }

    _onValueChanged() {
        const value = this.$input.value;
        if (this._value === value) return;

        if (value.length > 2) this.$input.setAttribute('list', 'x-mnemonic-wordlist');
        else this.$input.removeAttribute('list');

        this.complete = false;
        this.$el.classList.remove('complete');
        this._value = value;
    }
}
