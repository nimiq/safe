import XElement from "/x-element/x-element.js";
import WalletBackup from "/wallet-backup/wallet-backup.js";

export default class XWalletBackup extends XElement {

    html() {
        return `<a><img></a>`
    }

    onCreate() {
        this.$img = this.$('img');
        this.$a = this.$('a');
        this.$a.addEventListener('click', e => this._onBackedup())
    }

    _onBackedup(){
        this.fire('x-file-backup-complete');
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
}

// Todo: fix the ugly hack with setTimeout
// Todo: animate file to make clickablity more obvious
// Todo: use window.onBlur and window.onFocus to detect if user downloaded the file
// Todo: Fallback for iOS: long tap > "save image" (deactivate short tap) (feedback for "long" tap?)