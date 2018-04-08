import XElement from '/libraries/x-element/x-element.js';
import MixinModal from '/elements/mixin-modal/mixin-modal.js';
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js';

export default class XWelcomeModal extends MixinRedux(MixinModal(XElement)) {

    html() {
        return `
            <style>
                body:not(.enable-ledger) [import-ledger] {
                    display: none;
                }
            </style>
            <div class="modal-header">
                <i x-modal-close class="material-icons">close</i>
                <h2>Welcome to Nimiq Safe</h2>
            </div>
            <div class="modal-body center">
                <button class="create waiting">create new account</button>
                <a secondary import-ledger>Import Account From Ledger</a>
                <a secondary class="waiting" import-words>Import Account From Words</a>
                <a secondary class="waiting" import-file>Import Account From Access File</a>
            </div>
            `
    }

    static mapStateToProps(state) {
        return {
            keyguardReady: state.connection.keyguard
        }
    }

    _onPropertiesChanged(changes) {
        if (changes.keyguardReady) {
            this.$('.create').classList.remove('waiting');
            this.$('[import-words]').classList.remove('waiting');
            this.$('[import-file]').classList.remove('waiting');
        }
    }

    listeners() {
        return {
            'click button.create': this._onCreateAccount.bind(this),
            'click [import-ledger]': this._onImportLedger.bind(this),
            'click [import-words]': this._onImportWords.bind(this),
            'click [import-file]': this._onImportFile.bind(this)
        }
    }

    _onCreateAccount() {
        this.fire('x-accounts-create');
    }

    _onImportLedger() {
        this.fire('x-accounts-import-ledger');
    }

    _onImportWords() {
        this.fire('x-accounts-import-words');
    }

    _onImportFile() {
        this.fire('x-accounts-import-file');
    }
}

// Todo wording, content of this element
