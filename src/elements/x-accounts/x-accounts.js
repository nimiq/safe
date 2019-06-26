import XElement from '../../lib/x-element/x-element.js';
import MixinRedux from '../mixin-redux';
import XAccountModal from './x-account-modal.js';
import XAccountsList from './x-accounts-list.js';
import { spaceToDash } from '../../lib/parameter-encoding.js';
import XPopupMenu from '../x-popup-menu/x-popup-menu.js';
import { activeWallet$, activeWalletId$ } from '../../selectors/wallet$.js';
import { WalletType }  from '../../redux/wallet-redux.js';
import hubClient from '../../hub-client.js';

export default class XAccounts extends MixinRedux(XElement) {

    html() {
        return `
            <x-popup-menu x-main-action-only x-icon="add" class="hidden add">
            </x-popup-menu>
            <x-accounts-list></x-accounts-list>
            <x-account-modal></x-account-modal>
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
            'click .add button': this._onAddAccount,
            'x-account-selected': this._onAccountSelected
        };
    }

    _onAddAccount() {
        hubClient.addAccount(this.properties.activeWalletId);
    }

    _onAccountSelected(address) {
        address = spaceToDash(address);
        XAccountModal.show(address);
    }
}
