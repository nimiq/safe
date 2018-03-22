import MixinModal from '../mixin-modal/mixin-modal.js';
import XToast from '../x-toast/x-toast.js';
import XAccount from './x-account.js';
// todo, to be discussed: how to generalize this?
import keyguardPromise from '/apps/safe/keyguard.js';

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
                <button export class="secondary small">Export</button>
                <button rename class="secondary small">Rename</button>
                <button send class="small">Send from this account</button>
            </div>
        `
    }

    listeners() {
        return {
            'click button[export]': _ => this._onExport(this._address),
            'click button[rename]': _ => XToast.show('Rename account: ' + this._address),
            'click button[send]': _ => XToast.show('Send from account: ' + this._address)
        }
    }

    async _onExport(address) {
        const keyguard = await keyguardPromise;
        const encKey = await keyguard.export(address);
        console.log(`Encrypted private key ${JSON.stringify(encKey)}`);
        // todo: create account access file
    }
}
