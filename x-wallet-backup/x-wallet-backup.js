import XElement from "/libraries/x-element/x-element.js";
import WalletBackup from "/libraries/wallet-backup/wallet-backup.js";
import XDownloadableImage from "../x-downloadable-image/x-downloadable-image.js";

export default class XWalletBackup extends XElement {

    html() {
        return `<x-downloadable-image></x-downloadable-image>`
    }

    types() {
        /** @type {XDownloadableImage} */
        this.$downloadableImage = null;
    }

    children() {
        return [XDownloadableImage];
    }

    onCreate() {
        this.addEventListener('x-image-download', e => this._onImageDownload(e));
    }

    async backup(address, privateKey) {
        const backup = new WalletBackup(address, privateKey);
        const filename = backup.filename();
        this.$downloadableImage.src = await backup.toDataUrl();
        this.$downloadableImage.filename = filename;
    }

    _onImageDownload(e) {
        e.stopPropagation();
        this.fire('x-wallet-backup-complete');
    }
}
