import XElement from "/library/x-element/x-element.js";
import WalletBackup from "/library/wallet-backup/wallet-backup.js";

export default class XWalletBackup extends XElement {

    html() {
        return `<a x-grow><img></a>`
    }

    onCreate() {
        this.$img = this.$('img');
        this.$a = this.$('a');
        if (!this._canDeviceDownload) this.$a.target = '_blank';
        this.$a.addEventListener('touchstart', e => this._onDownload())
        this.$a.addEventListener('mousedown', e => this._onDownload())
    }

    _onDownload() {
        this.listenOnce('blur', e => this._onWindowBlur(), window);
    }

    _onWindowBlur() {
        this.listenOnce('focus', e => this._onWindowRefocus(), window);
    }

    _onWindowRefocus() {
        this.fire('x-wallet-backup-complete');
    }

    _canDeviceDownload() {
        return !(typeof this.$a.download === 'undefined');
    }

    backup(address, privateKey) {
        const backup = new WalletBackup(address, privateKey);
        setTimeout(e => {
            backup.toObjectUrl().then(url => {
                this.$img.src = url
                this.$a.href = url;
                this.$a.download = backup.filename();
            });
        }, 1000);
    }
}

// Todo: fix the ugly hack with setTimeout in WalletBackup
// Todo: animate file to make clickablity more obvious
// Todo: make our "download detecting hack" work on iOS
// Todo: make our "download detecting hack" work on Safari (in general: what if the file downloads immediately and no dialog opens?)
// Todo: Fallback for iOS: long tap > "save image" (deactivate short tap) (visual feedback for "long" tap)