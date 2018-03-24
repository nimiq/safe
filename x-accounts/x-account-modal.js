import MixinModal from '../mixin-modal/mixin-modal.js';
import XAccount from './x-account.js';

export default class XAccountModal extends MixinModal(XAccount) {
    html() {
        return `
            <div class="x-modal-header">
                <h2>Account Details</h2>
            </div>
            <div class="x-modal-body">
                <x-identicon></x-identicon>
                <x-address></x-address>
                <x-account>
                    <div class="x-account-info">
                        <span class="x-account-label"></span>
                        <div class="x-account-bottom">
                            <i class="hidden secure-icon" title="High security account"></i>
                            <x-amount></x-amount>
                        </div>
                    </div>
                </x-account>
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
        this.address = address;
        super.onEntry();
    }

}
