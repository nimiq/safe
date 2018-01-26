import XElement from "/library/x-element/x-element.js";
import WalletBackup from "/library/wallet-backup/wallet-backup.js";

export default class XWalletBackup extends XElement {

    html() {
        return `<a><img></a>`
    }

    onCreate() {
        this.$img = this.$('img');
        this.$a = this.$('a');
        this.$a.addEventListener('touchstart', e => this._onDownload())
        this.$a.addEventListener('mousedown', e => this._onDownload())
    }

    _onDownload(e) {
        this.listenOnce('blur', e => this._onWindowBlur(), window);
    }

    _onWindowBlur() {
        this.listenOnce('focus', e => this._onWindowRefocus(), window);
    }

    _onWindowRefocus() {
        this.fire('x-wallet-backup-complete');
    }

    _initDownload(url, filename) {
        this.$img.src = url;
        if (this._isDownloadSupported())
            this._initNativeDownload(url, filename);
        else
            this._initFallbackDownload();
    }

    _initNativeDownload(url, filename) {
        this.$a.href = url;
        this.$a.download = filename;
    }

    _initFallbackDownload() { // Hack to make image downloadable on iOS via long tap
        this.$a.href = 'javascript:void(0);';
    }

    _isDownloadSupported() { // Detect if browser supports native `download` attribute
        return !(typeof this.$a.download === 'undefined');
    }

    async backup(address, privateKey) {
        const backup = new WalletBackup(address, privateKey);
        const filename = backup.filename();
        const url = await backup.toObjectUrl();
        this._initDownload(url, filename);
    }
}

// Todo: animate file to make clickablity more obvious
// Todo: [Daniel] Fallback for iOS: long tap > "save image" (visual feedback for "long" tap)
// Todo: [Daniel] make our "download detecting hack" work on iOS
// Todo: [Daniel] make our "download detecting hack" work on Safari (in general: what if the file downloads immediately and no dialog opens?)