class ViewBackupPhrase extends XElement {
    children() { return [XMnemonicPhrase] }
    html() {
        return `
			<h1>Backup your Recovery Phrase</h1>
			<h2>Write down your passphrase to recover your key</h2>
			<x-mnemonic-phrase></x-mnemonic-phrase>
			<a href="#seed-validate" button>Validate</a>`
    }

    set privateKey(privateKey) {
        this.$mnemonicPhrase.privateKey = privateKey;
    }
}

// Todo: add warning. make user confirm he understands that everybody who sees the phrase has full control over the account's funds. screenshots are not safe.