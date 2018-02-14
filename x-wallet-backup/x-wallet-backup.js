import XElement from "/libraries/x-element/x-element.js";
import WalletBackup from "/libraries/wallet-backup/wallet-backup.js";
import XDownloadableImage from "../x-downloadable-image/x-downloadable-image.js";
import QrScanner from '/libraries/qr-scanner/qr-scanner.min.js';
import NanoApi from '/libraries/nano-api/nano-api.js';

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

    setKeyPair(keyPair) {
        this._keyPair = keyPair;
    }

    async createBackup(password) {
        const qrPosition = WalletBackup.calculateQrPosition();
        qrPosition.x += qrPosition.padding / 2; /* add half padding to cut away the rounded corners */
        qrPosition.y += qrPosition.padding / 2;
        qrPosition.width = qrPosition.size - qrPosition.padding;
        qrPosition.height = qrPosition.size - qrPosition.padding;

        let backup = null;
        let scanResult = null;
        let encryptedKey;
        do {
            console.log('attempt');
            encryptedKey = await this._importAndEncrypt(password);
            backup = new WalletBackup(this._keyPair.address, encryptedKey);
            try {
                scanResult = await QrScanner.scanImage(backup.$canvas, qrPosition, null, null, false, true);
            } catch(e) { }
        } while (scanResult !== encryptedKey);

        const filename = backup.filename();
        this.$downloadableImage.src = await backup.toDataUrl();
        this.$downloadableImage.filename = filename;
    }

    async _importAndEncrypt(password) {
        const api = NanoApi.getApi();
        await api.importKey(this._keyPair.privateKey, false);
        const encryptedKey = await api.exportEncrypted(password);
        return encryptedKey;
    }

    _onImageDownload(e) {
        e.stopPropagation();
        this.fire('x-wallet-download-complete');
    }

    _onBeforeEntry() {
        if (!this._keyPair) {
            throw Error('Not initialized');
        }
    }

    _onExit() {
        // Clear private information
        this._keyPair.privateKey = null;
        this._keyPair = null;
    }
}
