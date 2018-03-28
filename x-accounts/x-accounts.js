import XElement from '/libraries/x-element/x-element.js';
import XAccountModal from './x-account-modal.js';
import XAccountsList from './x-accounts-list.js';

export default class XAccounts extends XElement {

    html() {
        return `
            <div class="popupmenu">
                <button><i class="material-icons">menu</i></button>
                <div>
                    <button create><i class="material-icons">add</i> Create new account</button>
                    <button importFile><i class="material-icons">crop_portrait</i> Import Access File</button>
                    <button importWords><i class="material-icons">text_format</i> Import Recovery Words</button>
                </div>
            </div>
            <x-accounts-list></x-accounts-list>
            <x-account-modal x-route-aside="account"></x-account-modal>
        `;
    }

    children() {
        return [ XAccountsList, XAccountModal ];
    }

    listeners() {
        return {
            'click button[create]': this._onCreateAccount,
            'click button[importFile]': this._onImportFromFile,
            'click button[importWords]': this._onImportFromWords,
            'x-account-selected': this._onAccountSelected
        };
    }

    _onCreateAccount() {
        this.fire('x-accounts-create');
    }

    _onImportFromFile() {
        this.fire('x-accounts-import-file');
    }

    _onImportFromWords() {
        this.fire('x-accounts-import-words');
    }

    _onAccountSelected(address) {
        address = this._spaceToDash(address);
        XAccountModal.show(address);
    }

    _spaceToDash(string) {
        return string.replace(/ /gi, '-');
    }
}
