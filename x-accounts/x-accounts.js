import XElement from '/libraries/x-element/x-element.js';
import XAccountModal from './x-account-modal.js';
import XAccountsList from './x-accounts-list.js';

export default class XAccounts extends XElement {

    html() {
        return `
            <button create class="small secondary">&plus; Create</button>
            <button import class="small secondary">&#8615; Import</button>
            <x-accounts-list></x-accounts-list>
            <x-account-modal x-route-aside="account-modal"></x-account-modal>
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
        XAccountModal.show(address);
    }
}
