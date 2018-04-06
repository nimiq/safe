import XElement from '/libraries/x-element/x-element.js';
import XDownloadableImage from '/elements/x-downloadable-image/x-downloadable-image.js';
import MixinModal from '/elements/mixin-modal/mixin-modal.js';

export default class XAccountFileExportModal extends MixinModal(XElement) {
    html() {
        return `
            <div class="modal-header">
                <h2>Backup Access File</h2>
            </div>
            <div class="modal-body">
                <x-downloadable-image></x-downloadable-image>
            </div>
        `
    }

    children() {
        return [ XDownloadableImage ];
    }

    set(address, dataUrl) {
        this.$downloadableImage.filename = address.replace(/ /g, '+') + '.png';
        this.$downloadableImage.src = 'data:image/png;base64,' + dataUrl;
    }
}
