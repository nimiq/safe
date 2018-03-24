import XElement from '/libraries/x-element/x-element.js';
import MixinModal from '/elements/mixin-modal/mixin-modal.js';
import XSuccessMark from '/elements/x-success-mark/x-success-mark.js';
import accountManager from '/libraries/account-manager/account-manager.js';

export default class XWalletBackupImportModal extends MixinModal(XElement) {
    html() {
        return `
            <div class="modal-header">
                <h2>Import Account Access File</h2>
            </div>
            <div class="modal-body">
                <div class="file-import">
                    <button>Start import</button>
                    <a secondary>Use 24 Recovery Words instead</a>
                </div>
                <x-success-mark></x-success-mark>
            </div>
        `
    }

    children() {
        return [ XSuccessMark ];
    }

    listeners() {
        return {
            'click button': async () => (await accountManager).importFile(),
            'click a[secondary]': async () => (await accountManager).importWords()
        }
    }

    onCreate() {
        super.onCreate();
        this.$importDiv = this.$('div.file-import');
    }

    async success() {
        this.$importDiv.style.display = 'none';
        this.$successMark.$el.style.display = 'initial';
        await this.$successMark.animate();
        XWalletBackupImportModal.hide();
    }
}
