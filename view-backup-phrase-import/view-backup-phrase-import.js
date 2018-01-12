class ViewBackupPhraseImport extends XElement {
    children() { return [XMnemonicInput] }
    html() {
        return `
			<h1>Enter Your Recovery Phrase</h1>
			<x-mnemonic-input></x-mnemonic-input>
		`
    }
}