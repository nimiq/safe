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
                <button class="waiting create"><i class="material-icons">add</i> Create New Account</button>
                <button class="import-ledger"><i class="material-icons ledger-icon">&nbsp;</i> Import Ledger Account</button>
                <button class="waiting import-words"><i class="material-icons">text_format</i> Import Recovery Words</button>
                <button class="waiting import-file"><i class="material-icons">crop_portrait</i> Import Access File</button>
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
            this.$('.import-file').classList.remove('waiting');
        }
    }

    listeners() {
        return {
            'click button.create': this._onCreateAccount,
            'click button.import-ledger': this._onImportLedger,
            'click button.import-words': this._onImportFromWords,
            'click button.import-file': this._onImportFromFile,
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
