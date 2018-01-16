class ViewBackupPhraseValidate extends XView {

    html() {
        return `
            <h1>Validate Recovery Phrase</h1>
            <x-mnemonic-validate></x-mnemonic-validate>
        `
    }
    children() { return [XMnemonicValidate] }

    set privateKey(privateKey) {
        this.$mnemonicValidate.privateKey = privateKey
    }

    onShow(){
        this.$mnemonicValidate.reset();
    }
}

// Todo: Add back button