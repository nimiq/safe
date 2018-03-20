import MixinModal from '../mixin-modal/mixin-modal.js';
import XToast from '../x-toast/x-toast.js';
import XAccount from './x-account.js';
import MixinRedux from '/elements/mixin-redux/mixin-redux.js';

export default class XAccountModal extends MixinRedux(MixinModal(XAccount)) {
    html() {
        return `
            <h2>Account Details</h2>
            <x-account>
                <x-identicon></x-identicon>
                <div class="x-account-info">
                    <span class="x-account-label"></span>
                    <x-address></x-address>
                    <div class="x-account-bottom">
                        <i class="hidden secure-icon" label="High security account"></i>
                        <span class="x-account-balance">
                            <span class="dot-loader"></span> NIM
                        </span>
                    </div>
                </div>
            </x-account>
            <button export class="secondary small">Export</button>
            <button rename class="secondary small">Rename</button>
            <button send class="small">Send from this account</button>
        `
    }

    static mapStateToProps(state, props) {
        return {
            ...state.accounts.entries.get(props.address)
        };
    }

    listeners() {
        return {
            'click button[export]': _ => XToast.show('Export account: ' + this._address),
            'click button[rename]': _ => XToast.show('Rename account: ' + this._address),
            'click button[send]': _ => XToast.show('Send from account: ' + this._address)
        }
    }
}
