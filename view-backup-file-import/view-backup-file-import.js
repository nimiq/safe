class ViewBackupFileImport extends XElement {
    children() { return [XWalletBackupImport] }
    html() {
        return `<x-wallet-backup-import></x-wallet-backup-import>`;
    }
}