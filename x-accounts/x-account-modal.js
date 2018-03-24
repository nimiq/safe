import MixinModal from '../mixin-modal/mixin-modal.js';
import XAccount from './x-account.js';
import store from '/apps/safe/store.js';

export default class XAccountModal extends MixinModal(XAccount) {
    html() {
        return `
            <div class="x-modal-header">
                <h2 class="x-account-label"></h2>
            </div>
            <div class="x-modal-body">
                <x-identicon></x-identicon>
                <i class="hidden secure-icon" title="High security account"></i>
                <i class="hidden vesting-icon" title="Vesting contract"></i>
                <x-address></x-address>

                <div class="x-account-bottom">
                    <x-amount></x-amount>
                </div>

                <hr>

                <button export class="secondary small">Backup</button>
                <button rename class="secondary small">Rename</button>
                <button send class="small">Send from this account</button>
            </div>
        `
    }

    listeners() {
        return {
            'click button[export]': _ => this.fire('x-account-modal-export', this._address),
            'click button[rename]': _ => this.fire('x-account-modal-rename', this._address),
            'click button[send]': _ => this.fire('x-account-modal-new-tx', this._address)
        }
    }

    onEntry(address) {
        address = decodeURIComponent(address);
        let account = store.getState().accounts.entries.get(address);
        if (!account) account = { address };
        this.account = account;
        super.onEntry();
    }

}
