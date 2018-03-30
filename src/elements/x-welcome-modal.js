import XElement from '/libraries/x-element/x-element.js';
import MixinModal from '/elements/mixin-modal/mixin-modal.js';

export default class XWelcomeModal extends MixinModal(XElement) {

    html() {
        return `
            <div class="modal-header">
                <i x-modal-close class="material-icons">close</i>
                <h2>Welcome to Nimiq Safe</h2>
            </div>
            <div class="modal-body center">
                <button class="create">create new account</button>
                <button class="import">import account</button>
            </div>
            `
    }

    listeners() {
        return {
            'click button.create': this._onCreateAccount.bind(this),
            'click button.import': this._onImportAccount.bind(this)
        }
    }
    _onCreateAccount() {
        this.fire('x-accounts-create');
    }

    _onImportAccount() {
        this.fire('x-accounts-import');
    }
}

// Todo wording, content of this element
