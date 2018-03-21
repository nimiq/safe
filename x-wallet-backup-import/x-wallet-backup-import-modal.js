import XElement from '/libraries/x-element/x-element.js';
import XWalletBackupImport from './x-wallet-backup-import.js';
import MixinModal from '/elements/mixin-modal/mixin-modal.js';
import XSuccessMark from '/elements/x-success-mark/x-success-mark.js';

export default class XWalletBackupImportModal extends MixinModal(XElement) {
    html() {
        return `
            <div class="modal-header">
                <h2>Import Account Access File</h2>
            </div>
            <div class="modal-body">
                <div class="file-import">
                    <x-wallet-backup-import class="black"></x-wallet-backup-import>
                    <a secondary>Import Recovery Words instead</a>
                </div>
                <x-success-mark></x-success-mark>
            </div>
        `
    }

    children() {
        return [ XWalletBackupImport, XSuccessMark ];
    }

    onCreate() {
        super.onCreate();
        this.$importDiv = this.$('div.file-import');
    }

    reset() {
        console.log("modal reset()");
        this.$importDiv.style.display = 'initial';
        this.$successMark.$el.style.display = 'none';
        this.$walletBackupImport.reset();
    }

    async success() {
        this.$importDiv.style.display = 'none';
        this.$successMark.$el.style.display = 'initial';
        await this.$successMark.animate();
        XWalletBackupImportModal.hide();
    }
}
