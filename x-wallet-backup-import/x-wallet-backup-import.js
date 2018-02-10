import XElement from "/libraries/x-element/x-element.js";
import QrScanner from "/libraries/qr-scanner/qr-scanner.min.js";
import WalletBackup from "/libraries/wallet-backup/wallet-backup.js";
import XToast from "../x-toast/x-toast.js";

export default class XWalletBackupImport extends XElement {
    html() {
        return `
            <x-wallet-backup-import-icon></x-wallet-backup-import-icon>
            <x-wallet-backup-backdrop>Drop wallet file to import</x-wallet-backup-backdrop>
            <input type="file" accept="image/*">`
    }

    children() { return [XToast] }

    onCreate() {
        this.$fileInput = this.$('input');
        this.$importIcon = this.$('x-wallet-backup-import-icon');
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

        try {
            const decoded = await QrScanner.scanImage(file, qrPosition, null, null, false, true);
            this.fire('x-backup-import', decoded);
        } catch (e) {
            this._onQrError();
        }
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

    _onQrError() {
        this.animate('shake', this.$importIcon);
        this.$toast.show('Couldn\'t read Backup File');
    }
}

// Todo: x-wallet-backup-import should look similar to a x-wallet-backup. create svg with same dimensions and layout, a hexagon + qr pictogram 
// Todo: debug backdrop
// Todo: style backdrop
// Todo: remove handlers on hide