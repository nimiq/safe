class ViewBackupFileImport extends XElement {
    children() { return [XWalletBackupImport] }
    html() {
        return `
		<h1>Import Backup File</h1>
		<h2>Select a backup file to import an account</h2>
        <x-slides>
        	<x-wallet-backup-import></x-wallet-backup-import>
        	<x-pinpad></x-pinpad>
        </x-slides>
        `;
    }
}

// Todo: unlock wallet after import. call api
// Todo: warn user that importing a different account deletes the current account
// Todo: [low priority] support multiple accounts at once 
