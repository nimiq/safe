import XElement from "/libraries/x-element/x-element.js";
import QrScanner from "/libraries/qr-scanner/qr-scanner.min.js";
import BackupFile from "/libraries/backup-file/backup-file.js";
import XToast from "/secure-elements/x-toast/x-toast.js";

export default class XAccountFileImport extends XElement {
    html() {
        return `
            <x-account-file-import-icon></x-account-file-import-icon>
            <button>Select file</button>
            <x-account-file-import-backdrop>Drop Access File here to import</x-account-file-import-backdrop>
            <input type="file" accept="image/*">`
    }

    onCreate() {
        this.$fileInput = this.$('input');
        this.$importIcon = this.$('x-account-file-import-icon');
        this.$button = this.$('button');
        this._decoded = null;
        this._bindHandlers();

        this._defaultStyle = {
            backgroundImage: this.$importIcon.style.backgroundImage,
            opacity: this.$importIcon.style.opacity,
            textContent: this.$button.textContent
        };
    }

    _bindHandlers() {
        const dropZone = document.body;
        dropZone.addEventListener('drop', e => this._onFileDrop(e), false);
        dropZone.addEventListener('dragover', e => this._onDragOver(e), false);

        dropZone.addEventListener('dragexit', e => this._onDragEnd(e), false);
        dropZone.addEventListener('dragend', e => this._onDragEnd(e), false);

        this.addEventListener('click', e => this._openFileInput());
        this.$button.addEventListener('click', e => this._onButtonClicked(e));
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

        let qrPosition = BackupFile.calculateQrPosition();
        // add half padding to cut away the rounded corners
        qrPosition.x += qrPosition.padding / 2;
        qrPosition.y += qrPosition.padding / 2;
        qrPosition.width = qrPosition.size - qrPosition.padding;
        qrPosition.height = qrPosition.size - qrPosition.padding;

        try {
            this._decoded = await QrScanner.scanImage(file, qrPosition, null, null, false, true);
            this._setImage(file);
        } catch (e) {
            this._onQrError();
        }
    }

    _setImage(file) {
        const url = URL.createObjectURL(file);
        this.$importIcon.style.backgroundImage = `url(${url})`;
        this.$importIcon.style.opacity = 1;
        this.$button.textContent = 'Import';
        requestAnimationFrame(_ => URL.revokeObjectURL(url));
    }

    _onButtonClicked(e) {
        if (this._decoded) {
            e.stopPropagation();
            const decoded = this._decoded;
            this._decoded = null;
            this.fire('x-backup-import', decoded);
            this.reset();
        }
    }

    reset() {
        // Reset element
        this._decoded = null;
        this.$importIcon.style.backgroundImage = this._defaultStyle.backgroundImage;
        this.$importIcon.style.opacity = this._defaultStyle.opacity;
        this.$button.textContent = this._defaultStyle.textContent;
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
        XToast.show('Couldn\'t read Access File');
    }
}

// Todo: debug backdrop
// Todo: remove handlers on hide
