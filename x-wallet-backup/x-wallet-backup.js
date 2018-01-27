import XElement from "/library/x-element/x-element.js";
import WalletBackup from "/library/wallet-backup/wallet-backup.js";
import XDownloadableImage from "../x-downloadable-image/x-downloadable-image.js";

export default class XWalletBackup extends XElement {

    html() {
        return `<x-downloadable-image></x-downloadable-image>`
    }

    children() {
        return [XDownloadableImage];
    }

    async backup(address, privateKey) {
        const backup = new WalletBackup(address, privateKey);
        const filename = backup.filename();
        const url = await backup.toObjectUrl();
        this.$downloadableImage.src = url;
        this.$downloadableImage.filename = filename;
    }
}
