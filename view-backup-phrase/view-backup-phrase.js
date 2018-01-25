import XView from '/library/x-element/x-view.js';
import XSlides from '../x-slides/x-slides.js';
import XPrivacyAgent from '../x-privacy-agent/x-privacy-agent.js';
import XMnemonicPhrase from '../x-mnemonic-phrase/x-mnemonic-phrase.js';

export default class ViewBackupPhrase extends XView {
    html() {
        return `
            <h1>Backup your Recovery Phrase</h1>
            <x-slides>
                <x-slide>
                    <h2 secondary>First make sure your enviroment is safe.</h2>
                    <x-privacy-agent></x-privacy-agent>
                    <x-grow></x-grow>
                </x-slide>
                <x-slide>
                    <h2 secondary>Write down the following 24 words to recover your account later</h2>
                    <x-mnemonic-phrase></x-mnemonic-phrase>
                    <x-grow></x-grow>
                    <a href="#backup-phrase-validate" button>Validate</a>
                </x-slide>
            </x-slides>
            `;
    }
    children() { return [XSlides, XMnemonicPhrase, XPrivacyAgent] }

    onCreate() {
        this.addEventListener('x-surrounding-checked', e => this._onSurroundingChecked())
    }

    _onSurroundingChecked() {
        this.$slides.next();
        this.$mnemonicPhrase.animateEntry();
    }

    _animateButton() {
        this.$('[button]').classList.add('fade-in');
    }

    set privateKey(privateKey) {
        this.$slides.jumpTo(0);
        this.$mnemonicPhrase.privateKey = privateKey;
    }
}

// Todo: [low priority] add warning "screenshots are not safe" ?
