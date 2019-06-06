import XElement from '../../lib/x-element/x-element.js';
import MixinRedux from '../mixin-redux.js';
import XAccountModal from './x-account-modal.js';
import XAccountsList from './x-accounts-list.js';
import { spaceToDash } from '../../lib/parameter-encoding.js';
import { activeWallet$, activeWalletId$ } from '../../selectors/wallet$.js';
import { WalletType }  from '../../wallet-redux.js';

export default class XAccounts extends MixinRedux(XElement) {

    html() {
        return `
            <x-accounts-list></x-accounts-list>
            <a href="javascript:void(0)" class="add-address">
                <span icon-identicon-plus></span>
                <span class="label">Add Address</span>
            </a>
            <x-account-modal x-route-aside="account"></x-account-modal>
        `;
    }

    children() {
        return [ XAccountsList, XAccountModal ];
    }

    static mapStateToProps(state) {
        return {
            activeWallet: activeWallet$(state),
            activeWalletId: activeWalletId$(state),
        }
    }

    _onPropertiesChanged(changes) {
        if (changes.activeWallet) {
            this.$('.add-address').classList.toggle('display-none', this.properties.activeWallet.type === WalletType.LEGACY);
        }
    }

    listeners() {
        return {
            'click .add-address': this._onAddAccount,
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
