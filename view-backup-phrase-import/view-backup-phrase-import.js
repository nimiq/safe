class ViewBackupPhraseImport extends XView {
    html() {
        return `
			<h1>Enter Recovery Phrase</h1>
			<h2>Type the 24 words of your phrase to recover an account</h2>
			<x-slides>
				<x-privacy-agent></x-privacy-agent>
				<x-mnemonic-input></x-mnemonic-input>
			</x-slides>
		`
    }
    
    children() { return [XSlides, XMnemonicInput, XPrivacyAgent] }
    
    onCreate() {
        this.addEventListener('x-surrounding-checked', e => this._onSurrondingChecked())
    }

    _onSurrondingChecked() {
        this.$slides.next();
        this.$mnemonicInput.animateEntry();
    }
}