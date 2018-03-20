import XElement from '/libraries/x-element/x-element.js';
import { XAccount, XAccountModal } from './x-account.js';
import XAccountsList from './x-accounts-list.js';

export default class XAccounts extends XElement {
    html() {
        return `
            <button create class="small">&plus; Create</button>
            <button import class="small">&#8615; Import</button>
            <x-accounts-list></x-accounts-list>
        `
    }

    children() {
        return [XAccountsList];
    }

    listeners() {
        return {
            'click button[create]': this._onCreateAccount,
            'click button[import]': this._onImportAccount,
            'x-account-selected': this._onAccountSelected
        }
    }

    _onPropertiesChanged(changes) {
        // TODO best practice ?
        this.$accountsList._onPropertiesChanged(changes);
    }

    _onCreateAccount() {
        this.fire('x-accounts-create');
    }

    _onImportAccount() {
        this.fire('x-accounts-import');
    }

    _onAccountSelected(address) {
        XAccountModal.instance.setProperties(this.properties.get(address));
        XAccountModal.show();
    }
}
