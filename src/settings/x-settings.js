import XElement from '/libraries/x-element/x-element.js';
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js';
import XSettingVisualLockModal from './x-setting-visual-lock-modal.js';

export default class XSettings extends MixinRedux(XElement) {
    html(){
        return `
             <x-card>
                <h2>Settings</h2>
                <hr>
                <span class="setting" visual-lock>
                    Visual lock
                    <input type="checkbox" disabled>
                    <small>Lock access to the Safe with a pattern whenever the website is visited.</small>
                </span>
                <span class="setting" onclick="localStorage.removeItem('persistedState'); window.skipPersistingState = true; location.reload();">
                    Delete persistence
                    <small>This does not delete your accounts. It only deletes your transaction history and balances, which will be loaded again from the network.</small>
                </span>
             </x-card>
        `
    }

    onCreate() {
        if (localStorage.lock) this.$('[visual-lock] input').checked = true;
    }

    listeners() {
        return {
            'click [visual-lock]': this._onClickVisualLock
        }
    }

    _onClickVisualLock() {
        if (localStorage.lock) {
            const remove = confirm('Do you want to remove the lock?');
            if (remove) {
                localStorage.removeItem('lock');
                this.$('[visual-lock] input').checked = false;
            }
            return;
        }

        XSettingVisualLockModal.show();
    }

    static mapStateToProps(state) {
        /*return {
            settings: state.accounts.settings
        };*/
    }

    _onPropertiesChanged(changes) {

    }
}
