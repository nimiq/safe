import XElement from '/libraries/x-element/x-element.js';
import XAccountModal from './x-account-modal.js';
import XAccountsList from './x-accounts-list.js';
import { spaceToDash } from '/libraries/nimiq-utils/parameter-encoding/parameter-encoding.js';
import XPopupMenu from '/elements/x-popup-menu/x-popup-menu.js';

export default class XAccounts extends XElement {

    html() {
        return `
            <x-popup-menu x-icon="add">
                <button create><i class="material-icons">add</i> Create new account</button>
                <button importLedger><i class="material-icons ledger-icon">&nbsp;</i> Import Account from Ledger</button>
                <button importWords><i class="material-icons">text_format</i> Import from Recovery Words</button>
                <button importFile><i class="material-icons">crop_portrait</i> Import from Access File</button>
            </x-popup-menu>
            <x-accounts-list></x-accounts-list>
            <x-account-modal x-route-aside="account"></x-account-modal>
        `;
    }

    children() {
        return [ XPopupMenu, XAccountsList, XAccountModal ];
    }

    listeners() {
        return {
            'click button[create]': this._onCreateAccount,
            'click button[importLedger]': this._onImportLedger,
            'click button[importWords]': this._onImportFromWords,
            'click button[importFile]': this._onImportFromFile,
            'x-account-selected': this._onAccountSelected
        };
    }

    _onCreateAccount() {
        this.fire('x-accounts-create');
    }

    _onImportLedger() {
        this.fire('x-accounts-import-ledger');
    }

    _onImportFromWords() {
        this.fire('x-accounts-import-words');
    }

    _onImportFromFile() {
        this.fire('x-accounts-import-file');
    }

    _onAccountSelected(address) {
        address = spaceToDash(address);
        XAccountModal.show(address);
    }
}
