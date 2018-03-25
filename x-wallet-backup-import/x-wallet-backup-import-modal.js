import XElement from '/libraries/x-element/x-element.js';
import MixinModal from '/elements/mixin-modal/mixin-modal.js';
import XSuccessMark from '/elements/x-success-mark/x-success-mark.js';
import accountManager from '/libraries/account-manager/account-manager.js';

export default class XWalletBackupImportModal extends MixinModal(XElement) {
    html() {
        return `
            <div class="modal-header">
                <h2>Import Account</h2>
            </div>
            <div class="modal-body">
                <div class="import">
                    <br>
                    <button>Import from file</button>
                    <a secondary>Use 24 Recovery Words</a>
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
        this.$importDiv = this.$('div.import');
    }

    async success() {
        this.$importDiv.style.display = 'none';
        this.$successMark.$el.style.display = 'initial';
        await this.$successMark.animate();
        XWalletBackupImportModal.hide();
    }

    reset() {
        this.$importDiv.style.display = 'initial';
        this.$successMark.$el.style.display = 'none';
    }
}
