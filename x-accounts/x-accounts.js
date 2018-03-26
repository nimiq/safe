import XElement from '/libraries/x-element/x-element.js';
import XAccountModal from './x-account-modal.js';
import XAccountsList from './x-accounts-list.js';

export default class XAccounts extends XElement {

    html() {
        return `
            <button create class="small secondary" title="Create new account">&plus;<span> Create</span></button>
            <button import class="small secondary" title="Import your account">&#8615;<span> Import</span></button>
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
            'click button[import]': this._onImportAccount,
            'x-account-selected': this._onAccountSelected
        };
    }

    _onCreateAccount() {
        this.fire('x-accounts-create');
    }

    _onImportAccount() {
        this.fire('x-accounts-import');
    }

    _onAccountSelected(address) {
        address = this._spaceToDash(address);
        XAccountModal.show(address);
    }

    _spaceToDash(string) {
        return string.replace(/ /gi, '-');
    }
}
