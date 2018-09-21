import XElement from '/libraries/x-element/x-element.js';
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js';
import XAccountModal from './x-account-modal.js';
import XAccountsList from './x-accounts-list.js';
import { spaceToDash } from '/libraries/nimiq-utils/parameter-encoding/parameter-encoding.js';
import XPopupMenu from '/elements/x-popup-menu/x-popup-menu.js';

export default class XAccounts extends MixinRedux(XElement) {

    html() {
        return `
            <x-popup-menu x-icon="add">
                <button class="create"><i class="material-icons">add</i> Create New Account</button>
                <button class="import"><i class="material-icons">crop_portrait</i> Import Wallet/Account</button>
                <button class="waiting import-ledger"><i class="material-icons ledger-icon">&nbsp;</i> Import Ledger Account</button>
            </x-popup-menu>
            <x-accounts-list></x-accounts-list>
            <x-account-modal x-route-aside="account"></x-account-modal>
        `;
    }

    children() {
        return [ XPopupMenu, XAccountsList, XAccountModal ];
    }

    static mapStateToProps(state) {
        return {
            keyguardReady: state.connection.keyguard
        }
    }

    _onPropertiesChanged(changes) {
        if (changes.keyguardReady) {
            this.$('.create').classList.remove('waiting');
            this.$('.import-words').classList.remove('waiting');
            this.$('.import').classList.remove('waiting');
        }
    }

    listeners() {
        return {
            'click button.create': this._onCreateAccount,
            'click button.import-ledger': this._onImportLedger,
            'click button.import': this._onImport,
            'x-account-selected': this._onAccountSelected
        };
    }

    _onCreateAccount() {
        this.fire('x-accounts-create');
    }

    _onImportLedger() {
        this.fire('x-accounts-import-ledger');
    }

    _onImport() {
        this.fire('x-accounts-import');
    }

    _onAccountSelected(address) {
        address = spaceToDash(address);
        XAccountModal.show(address);
    }
}
