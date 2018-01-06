class XMnemonicInput extends XElement {

    onCreate() {
        this.$fields = [];
        this.$form = document.createElement('form');
        for(let i = 0; i < 24; i++) {
            const field = new XMnemonicInputField(document.createElement('x-word-input'));
            this.$form.appendChild(field.$el);
            this.$fields.push(field);
        }
        this.$el.appendChild(this.$form);

        this.addEventListener('complete', e => this._onFieldComplete(e));

        this.$fields[0].$input.focus();
    }

    _onFieldComplete(e) {
        if(e.detail[0].$input === document.activeElement && !e.detail[1]) {
            // Find active field
            const index = Array.prototype.indexOf.call(this.$fields, e.detail[0]);
            if(index < this.$fields.length - 1)
                // Set focus to next field
                this.$fields[index + 1].$input.focus();
        }

        this._checkPhraseComplete();
    }

    _checkPhraseComplete() {
        const check = this.$fields.find(field => !field._complete);
        if(typeof check === 'undefined') {
            const mnemonic = this.$fields.map(field => field.$input.value).join(' ');
            this.fire('recovered', MnemonicPhrase.mnemonicToKey(mnemonic));
        }
    }
}

class XMnemonicInputField extends XElement {
    onCreate() {
        this.$input = document.createElement('input');
        this.$input.type = 'text';
        this.$el.appendChild(this.$input);

        this.$input.addEventListener('keydown', e => this._onKeyDown(e));
        this.$input.addEventListener('input', e => this._onInput(e));
        this.$input.addEventListener('blur', e => this._onBlur(e));

        this._value = '';
    }

    _onKeyDown(e) {
        const value = this.$input.value;
        if(e.keyCode === 32 /* space */ || e.keyCode === 9 /* tab */ || e.type === 'blur') {
            if(value.length >= 3) {
                const index = MnemonicPhrase.DEFAULT_WORDLIST.indexOf(value);
                if(index > -1) {
                    this._complete = true;
                    this.fire('complete', [this, e.keyCode === 9 /* tab */]);
                    this.$input.classList.add('complete');
                }
                // else {
                //     this._complete = false;
                //     this.$input.classList.remove('complete');
                // }
            }

            if(e.keyCode === 32 /* space */) e.preventDefault();
        }
    }

    _onInput(e) {
        const value = this.$input.value;
        if(this._value !== value) {
            this._complete = false;
            this.$input.classList.remove('complete');
        }
        this._value = value;
    }

    _onBlur(e) {
        if(this._complete) return;

        this._onKeyDown(e);
    }
}
