import XView from '/library/x-element/x-view.js';
import XMnemonicValidate from '../x-mnemonic-validate/x-mnemonic-validate.js';

export default class ViewBackupPhraseValidate extends XView {

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

    onHide(){
        this.$mnemonicValidate.reset();
    }
}

// Todo: Add back button