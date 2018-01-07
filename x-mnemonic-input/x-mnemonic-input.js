class XMnemonicInput extends XElement {

    onCreate() {
        const $body = document.querySelector('body')
        $body.insertBefore(document.createTextNode('v4'), $body.firstChild);

        this.$datalist = document.createElement('datalist');
        this.$datalist.setAttribute('id', 'x-mnemonic-wordlist');
        for( let i = 0; i < MnemonicPhrase.DEFAULT_WORDLIST.length; i++) {
            const option = document.createElement('option');
            option.textContent = MnemonicPhrase.DEFAULT_WORDLIST[i];
            this.$datalist.appendChild(option);
        }
        this.$el.appendChild(this.$datalist);

        this.$fields = [];
        this.$form = document.createElement('form');
        this.$form.setAttribute('autocomplete', 'off');
        for (let i = 0; i < 24; i++) {
            const field = XMnemonicInputField.createElement();
            this.$form.appendChild(field.$el);
            this.$fields.push(field);
        }
        this.$el.appendChild(this.$form);

        this.addEventListener('complete', e => this._onFieldComplete(e));

        this.$fields[0].$input.focus();
    }

    _onFieldComplete(e) {
        if (e.detail[0].$input === document.activeElement && !e.detail[1]) {
            // Find active field
            const index = Array.prototype.indexOf.call(this.$fields, e.detail[0]);
            if (index < this.$fields.length - 1)
                // Set focus to next field
                this.$fields[index + 1].$input.focus();
        }

        this._checkPhraseComplete();
    }

    _checkPhraseComplete() {
        const check = this.$fields.find(field => !field._complete);
        if (typeof check !== 'undefined') return;
        const mnemonic = this.$fields.map(field => field.$input.value).join(' ');
        try {
            const privateKey = MnemonicPhrase.mnemonicToKey(mnemonic);
            this.fire('recovered', privateKey);
            this._animateSuccess();
        }
        catch(e) {
            console.log(e.message);
        }
    }

    _animateSuccess() {
        //
    }
}

class XMnemonicInputField extends XElement {
    onCreate() {
        this.$input = this.$('input');
        this.$input.addEventListener('keydown', e => this._onKeyDown(e));
        this.$input.addEventListener('input', e => this._onInput(e));
        this.$input.addEventListener('blur', e => this._onBlur(e));

        this._value = '';
    }

    _onKeyDown(e) {
        console.log('_onKeyDown', e.keyCode, e.type);
        const value = this.$input.value;
        if (e.keyCode === 32 /* space */ || e.keyCode === 9 /* tab */ || e.type === 'blur' || e.type === 'input') {
            if (value.length >= 3) {
                const index = MnemonicPhrase.DEFAULT_WORDLIST.indexOf(value);
                if (index > -1) {
                    this._complete = true;
                    this.fire('complete', [this, e.keyCode === 9 /* tab */ ]);
                    this.$input.classList.add('complete');
                }
                else {
                    this.$input.classList.add('invalid');
                }
            }

            if (e.keyCode === 32 /* space */ ) e.preventDefault();
        }
    }

    _onInput(e) {
        console.log('_onInput', e.data);

        if(typeof e.data === 'undefined') { // No key pressed, but autocomplete selected
            this._onKeyDown(e);
            return;
        }

        let value = this.$input.value;

        if (value.toLowerCase() !== value) {
            this.$input.value = value.toLowerCase();
            value = this.$input.value;
        }

        if(value.length > 2) this.$input.setAttribute('list', 'x-mnemonic-wordlist');
        else this.$input.removeAttribute('list');

        if (this._value === value) return;

        this._complete = false;
        this.$input.classList.remove('complete');
        this.$input.classList.remove('invalid'); // Multiple classes in remove() are not supported by IE
        this._value = value;
    }

    _onBlur(e) {
        console.log('_onBlur');
        if (this._complete) return;
        this._onKeyDown(e);
    }

    html() {
        return `<input type="text" autocorrect="off" autocapitalize="none" spellcheck="false">`;
    }
}
