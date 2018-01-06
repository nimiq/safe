class XWalletBackupImport extends XElement {
    onCreate() {
        this._bindHandlers();
    }

    _bindHandlers() {
        const dropZone = document.body;
        dropZone.addEventListener('drop', e => this._onFileDrop(e), false);
        dropZone.addEventListener('dragover', e => this._onDragOver(e), false);

        dropZone.addEventListener('dragexit', e => this._onDragEnd(e), false);
        dropZone.addEventListener('dragend', e => this._onDragEnd(e), false);
    }

    _onFileDrop(event) {
        this._stopPropagation(event);
        this._onDragEnd();
        // Get files
        const files = event.dataTransfer.files;
        const file = files[0];
        this.fire('x-wallet-import', file);
        // TODO: call qr-scanner
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
