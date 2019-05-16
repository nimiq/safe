import XElement from '/libraries/x-element/x-element.js';
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js';
import XAccountModal from './x-account-modal.js';
import XAccountsList from './x-accounts-list.js';
import { spaceToDash } from '/libraries/nimiq-utils/parameter-encoding/parameter-encoding.js';
import XPopupMenu from '/elements/x-popup-menu/x-popup-menu.js';
import { activeWallet$, activeWalletId$ } from '/apps/safe/src/selectors/wallet$.js';
import { WalletType }  from '/apps/safe/src/wallet-redux.js';

export default class XAccounts extends MixinRedux(XElement) {

    html() {
        return `
            <x-popup-menu x-icon="add" class="hidden">
                <button class="add"><i class="material-icons">add</i> Add Address to your Account</button>
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
            activeWallet: activeWallet$(state),
            activeWalletId: activeWalletId$(state),
        }
    }

    _onPropertiesChanged(changes) {
        if (changes.activeWallet) {
            this.$('x-popup-menu').classList.toggle('hidden', this.properties.activeWallet.type === WalletType.LEGACY);
        }
    }

    listeners() {
        return {
            'click button.add': this._onAddAccount,
            'x-account-selected': this._onAccountSelected
        };
    }

    _onAddAccount() {
        this.fire('x-accounts-add', this.properties.activeWalletId);
    }

    _onAccountSelected(address) {
        address = spaceToDash(address);
        XAccountModal.show(address);
    }
}
