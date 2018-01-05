class XMnemonicValidate extends XElement {
    onCreate() {
        this.$slider = new XSlider();

        this.$indices = this.$el.querySelectorAll('x-mnemonic-validate-index');
        this.$words = this.$el.querySelectorAll('[x-mnemonic-validate-word]');

        this.updateRequiredWords();
    }

    _generateIndices() {
        this.indices = [
            Math.floor(Math.random() * 8),
            Math.floor(Math.random() * 8) + 8,
            Math.floor(Math.random() * 8) + 16,
        ];
    }

    _displayIndices() {
        for(let i = 0; i < this.$indices.length; i++) {
            this.$indices[i].textContent = this.indices[i] + 1;
        }
    }

    set privateKey(privateKey) {
        this.mnemonic = MnemonicPhrase.keyToMnemonic(privateKey);
    }

    updateRequiredWords() {
        this._generateIndices();
        this._displayIndices();
    }

    validate() {
        if(!this.mnemonic) throw new Error('Mnemonic to validate against is not set');
        const words = this.mnemonic.split(/\s+/g);

        for(let i = 0; i < this.indices.length; i++) {
            if(this.$words[i].value !== words[this.indices[i]]) {
                this.fire('invalid');
                return false;
            }
        }

        this.fire('validated');
        return true;
    }
}
