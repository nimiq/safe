import XView from '/library/x-element/x-view.js';
import XSlides from '../x-slides/x-slides.js';
import XPrivacyAgent from '../x-privacy-agent/x-privacy-agent.js';
import XMnemonicInput from '../x-mnemonic-input/x-mnemonic-input.js';

export default class ViewBackupPhraseImport extends XView {
    html() {
        return `
            <h1>Enter Recovery Phrase</h1>
            <x-slides>
                <x-slide>
                    <h2 secondary>First make sure your enviroment is safe.</h2>
                    <x-privacy-agent></x-privacy-agent>
                    <x-grow></x-grow>
                </x-slide>
                <x-slide>
                    <h2 secondary>Enter the 24 words of your backup phrase to recover your account</h2>
                    <x-mnemonic-input></x-mnemonic-input>
                    <x-grow></x-grow>
                </x-slide>
            </x-slides>
        `
    }

    children() { return [XSlides, XMnemonicInput, XPrivacyAgent] }

    onCreate() {
        this.addEventListener('x-surrounding-checked', e => this._onSurrondingChecked())
    }

    _onSurrondingChecked() {
        this.$slides.next()
        this.$mnemonicInput.animateEntry();
    }
}

// Todo: Debug x-mnemonic-input to work in x-slide