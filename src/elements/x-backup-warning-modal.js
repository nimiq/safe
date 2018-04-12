import XElement from '/libraries/x-element/x-element.js';
import MixinModal from '/elements/mixin-modal/mixin-modal.js';
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js';
import XAccount from '/elements/x-accounts/x-account.js';
import needsBackup$ from '../selectors/needsBackup$.js';
import { rememberBackup, backupCanceled } from '/elements/x-accounts/accounts-redux.js';

export default class XBackupWarningModal extends MixinRedux(MixinModal(XElement)) {
    html() {
        return `
            <div class="modal-header">
                <i x-modal-close class="material-icons">close</i>
                <h2>Please Backup your Account</h2>
            </div>
            <div class="modal-body">
                <x-account></x-account>
                <div>
                    You should create a backup for this account! Otherwise, all your funds might be lost.
                    
                    <button>Create backup now</button>
                    <a secondary>I already have a backup</a>
                </div>
            </div>
        `
    }

    children() {
        return [ XAccount ];
    }

    onHide() {
        this.actions.backupCanceled(this.properties.account.address);
    }

    static get actions() {
        return {
            rememberBackup, backupCanceled
        }
    }

    static mapStateToProps(state) {
        return {
            account: needsBackup$(state)
        }
    }

    _onPropertiesChanged(changes) {
        if (changes.account) {
            this.$account.account = changes.account;
            this.show();
        }
    }

    listeners() {
        return {
            'click button': _ => this.fire('x-account-modal-backup-file', this.properties.account.address),
            'click a[secondary]': this._alreadyBackuped.bind(this)
        }
    }

    _alreadyBackuped() {
        this.actions.rememberBackup(this.properties.account.address);
        this.hide();
    }
}
