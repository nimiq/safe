class ViewBackupPhraseImport extends XElement {
    children() { return [XMnemonicInput] }
    html() {
        return `
			<h1>Enter Recovery Phrase</h1>
			<h2>Type the 24 words of your phrase to recover a wallet</h2>
			<x-mnemonic-input></x-mnemonic-input>
		`
    }
}