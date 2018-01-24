import XElement from "/library/x-element/x-element.js";
import QrScanner from "/library/qr-scanner/qr-scanner.min.js";
import WalletBackup from "/library/wallet-backup/wallet-backup.js";

export default class XWalletBackupImport extends XElement {
    html() {
        return `
            <x-wallet-backup-import-icon></x-wallet-backup-import-icon>
            <x-wallet-backup-backdrop>Drop wallet file to import</x-wallet-backup-backdrop>
            <input type="file" accept="image/png">`
    }
    
    onCreate() {
        this.$fileInput = this.$('input');
        this._bindHandlers();
    }

    _bindHandlers() {
        const dropZone = document.body;
        dropZone.addEventListener('drop', e => this._onFileDrop(e), false);
        dropZone.addEventListener('dragover', e => this._onDragOver(e), false);

        dropZone.addEventListener('dragexit', e => this._onDragEnd(e), false);
        dropZone.addEventListener('dragend', e => this._onDragEnd(e), false);

        this.addEventListener('click', e => this._openFileInput());
        this.$fileInput.addEventListener('change', e => this._onFileSelected(e));
    }

    _openFileInput() {
        this.$fileInput.click();
    }

    _onFileSelected(e) {
        this._onFileDrop(e);
        this.$fileInput.value = null;
    }

    async _onFileDrop(event) {
        this._stopPropagation(event);
        this._onDragEnd();
        // Get files
        const files = event.dataTransfer ? event.dataTransfer.files : event.target.files;
        const file = files[0];

        let qrPosition = WalletBackup.calculateQrPosition();
        // add half padding to cut away the rounded corners
        qrPosition.x += qrPosition.padding / 2;
        qrPosition.y += qrPosition.padding / 2;
        qrPosition.width = qrPosition.size - qrPosition.padding;
        qrPosition.height = qrPosition.size - qrPosition.padding;

        const decoded = await QrScanner.scanImage(file, qrPosition, null, null, false, true);
        this.fire('x-backup-import', decoded);
    }

    _onDragOver(event) {
        this._stopPropagation(event);
        event.dataTransfer.dropEffect = 'copy';
        this.$el.setAttribute('active', 1);
    }

    _stopPropagation(event) {
        event.stopPropagation();
        event.preventDefault();
    }

    _onDragEnd() {
        this.$el.removeAttribute('active');
    }
}

// Todo: x-wallet-backup-import should look similar to a x-wallet-backup. create svg with same dimesions and layout, a hexagon + qr pictogram 
// Todo: file input should work on iOS
// Todo: handle qr scan error. handle "no backup qr"-error. ui-feedback. x-toast?
// Todo: debug backdrop
// Todo: style backdrop