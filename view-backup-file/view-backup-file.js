class ViewBackupFile extends XElement {
    children() { return [XWalletBackup] }
    html() {
        return `
			<h1>Backup your Recovery File</h1>
			<h2>Download your Recovery File to recover your wallet</h2>
			<x-wallet-backup></x-wallet-backup>
			<a href="#seed-validate" button>Validate</a>`
    }

    backup(address, privateKey) {
        this.$walletBackup.backup(address, privateKey);
    }
}