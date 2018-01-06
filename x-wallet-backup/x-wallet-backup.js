class XWalletBackup extends XElement {
    onCreate() {
        this.$img = this.$('img');
        this.$a = this.$('a');
    }

    backup(address, privateKey) {
        const backup = new WalletBackup(address, privateKey);
        setTimeout(e => {
            backup.toObjectUrl().then(url => {
                this.$img.src = url
                // if (typeof a.download === 'undefined') return;
                this.$a.href = url;
                this.$a.download = backup.filename();
            });
        }, 1000);
    }

    html() {
        return `<a><img></a>`
    }
}