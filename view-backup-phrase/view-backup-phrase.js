class ViewBackupPhrase extends XElement {
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
        this.$mnemonicPhrase.privateKey = privateKey;
    }

    html() {
        return `
            <h1>Backup your Recovery Phrase</h1>
            <h2>Write down the following 24 words to recover your account later</h2>
            <x-slides>
                <x-slide>
                    <x-privacy-agent></x-privacy-agent>
                </x-slide>
                <x-slide>
                    <x-mnemonic-phrase></x-mnemonic-phrase>
                    <x-grow></x-grow>
                    <a href="#backup-phrase-validate" button>Validate</a>
                </x-slide>
            </x-slides>
            `;
    }
}

// Todo: add warning. make user confirms he understands that everybody who sees the phrase has full control over the account's funds. screenshots are not safe.
// Todo: add a seperate file for animations and implement "fade-in". the framework animations.css might be a blueprint. 
// Todo: add `.animate($el,animationName)` to `XElement` which automatically removes the class `animationName` after the animation fininished