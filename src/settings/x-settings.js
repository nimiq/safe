import XElement from '/libraries/x-element/x-element.js';
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js';
import XSettingVisualLockModal from './x-setting-visual-lock-modal.js';
import XSendPreparedTransactionModal from '/elements/x-send-transaction/x-send-prepared-transaction-modal.js';
import { showAllDecimals } from './settings-redux.js';

export default class XSettings extends MixinRedux(XElement) {
    html(){
        return `
             <x-card>
                <h2>Settings</h2>
                <hr>
                <span class="setting" show-all-decimals>
                    Show all decimals
                    <input type="checkbox" disabled>
                    <small>Show all five decimals when displaying balances.</small>
                </span>
                <!--
                <span class="setting" visual-lock>
                    Visual lock
                    <input type="checkbox" disabled>
                    <small>Lock access to the Safe with a pattern whenever the website is visited.</small>
                </span>
                -->
                <span class="setting" prepared-tx>
                    Send prepared transaction
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
        super.onCreate();
    }

    listeners() {
        return {
            'click [show-all-decimals]': this._onClickShowAllDecimals,
            //'click [visual-lock]': this._onClickVisualLock,
            'click [prepared-tx]': () => XSendPreparedTransactionModal.show()
        }
    }

    static get actions() { return { showAllDecimals } }

    _onClickShowAllDecimals() {
        this.actions.showAllDecimals(!this.$('[show-all-decimals] input').checked);
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
        return state.settings;
    }

    _onPropertiesChanged(changes) {

        if (changes.showAllDecimals !== undefined) {
            document.body.classList.toggle('setting-show-all-decimals', this.settings.showAllDecimals);
            this.$('[show-all-decimals] input').checked = this.settings.showAllDecimals;
        }
    }

    get settings() {
        return this.properties;
    }
}
