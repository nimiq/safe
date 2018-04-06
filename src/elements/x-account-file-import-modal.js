import XElement from '/libraries/x-element/x-element.js';
import XAccountFileImport from './x-account-file-import.js';
import MixinModal from '/elements/mixin-modal/mixin-modal.js';

export default class XAccountFileImportModal extends MixinModal(XElement) {
    html() {
        return `
            <div class="modal-header">
                <h2>Import Access File</h2>
            </div>
            <div class="modal-body">
                <x-account-file-import class="black"></x-account-file-import>
            </div>
        `
    }

    children() {
        return [ XAccountFileImport ];
    }

    reset() {
        this.$accountFileImport.reset();
    }
}
