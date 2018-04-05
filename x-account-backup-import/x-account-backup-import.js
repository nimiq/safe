import XElement from "/libraries/x-element/x-element.js";
import QrScanner from "/libraries/qr-scanner/qr-scanner.min.js";
import WalletBackup from "/libraries/backup-file/backup-file.js";
import XToast from "/secure-elements/x-toast/x-toast.js";

export default class XAccountBackupImport extends XElement {
    html() {
        return `
            <x-account-backup-import-icon></x-account-backup-import-icon>
            <button>Select file</button>
            <input type="file" accept="image/*">`
    }

    onCreate() {
        this.$fileInput = this.$('input');
        this.$importIcon = this.$('x-account-backup-import-icon');
        this.$button = this.$('button');
    }

    onEntry() {
        if (this._boundListeners.size === 0) {
            this.__bindListeners();
        }
    }

    onExit() {
        this.__removeListeners();
    }

    listeners() {
        return {
            'drop': this._onFileDrop.bind(this),
            'dragover': this._onDragOver.bind(this),
            'dragexit': this._onDragEnd.bind(this),
            'dragend': this._onDragEnd.bind(this),
            'click': this._openFileInput.bind(this),
            'change input': this._onFileSelected.bind(this)
        }
    }

    async _onFileDrop(_, event) {
        this._stopPropagation(event);
        this._onDragEnd();

        const files = event.dataTransfer.files;
        this._readFile(files[0]);
    }

    _onDragOver(_, event) {
        this._stopPropagation(event);
        event.dataTransfer.dropEffect = 'copy';
        this.$el.setAttribute('active', 1);
    }

    _onDragEnd() {
        this.$el.removeAttribute('active');
    }

    _openFileInput() {
        this.$fileInput.click();
    }

    _onFileSelected(_, event) {
        const files = event.target.files;
        this._readFile(files[0]);
        this.$fileInput.value = null;
    }

    _onQrError() {
        this.animate('shake', this.$importIcon);
        XToast.error('Couldn\'t read Backup File');
    }

    _stopPropagation(event) {
        event.stopPropagation();
        event.preventDefault();
    }

    async _readFile(file) {
        let qrPosition = WalletBackup.calculateQrPosition();

        try {
            const decoded = await QrScanner.scanImage(file, qrPosition, null, null, false, true);
            this.fire('x-read-file', decoded);
        } catch (e) {
            this._onQrError();
        }
    }
}
