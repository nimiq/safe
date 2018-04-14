import XElement from '/libraries/x-element/x-element.js';
import MixinModal from '/elements/mixin-modal/mixin-modal.js';
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js';
import XAccount from '/elements/x-accounts/x-account.js';
import needsUpgrade$ from '../selectors/needsUpgrade$.js';
import { upgradeCanceled } from '/elements/x-accounts/accounts-redux.js';

export default class XUpgradeModal extends MixinRedux(MixinModal(XElement)) {
    html() {
        return `
            <div class="modal-header">
                <i x-modal-close class="material-icons">close</i>
                <h2>Please Upgrade your Account</h2>
            </div>
            <div class="modal-body center">
                <x-account></x-account>
                <div class="spacing-bottom spacing-top -left">
                    To protect your funds, please upgrade your account to a Nimiq Safe Account. You will create a backup and get a nice green checkmark.
                </div>
                <button>Upgrade now</button>
            </div>
        `
    }

    children() {
        return [ XAccount ];
    }

    onHide() {
        if (this.properties.account) {
            // When the upgrade is cancelled, this property is still set
            this.actions.upgradeCanceled(this.properties.account.address);
        }
    }

    static get actions() {
        return {
            upgradeCanceled
        }
    }

    static mapStateToProps(state) {
        return {
            account: needsUpgrade$(state)
        }
    }

    _onPropertiesChanged(changes) {
        const account = changes.account;

        if (account) {
            this.$account.account = account;

            if (!account.upgradeCanceled || Date.now() - account.upgradeCanceled > 1000 * 3600 * 24) {
                this.show();
            }
        }
    }

    listeners() {
        return {
            'click button': _ => this.fire('x-upgrade-account', this.properties.account.address)
        }
    }
}
