import XElement from '/libraries/x-element/x-element.js';
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js';
import XSettingVisualLockModal from './x-setting-visual-lock-modal.js';
import XSendPreparedTransactionModal from '/elements/x-send-transaction/x-send-prepared-transaction-modal.js';
import { showAllDecimals } from './settings-redux.js';
import { Store } from '../store.js';
import { getString } from '../strings.js';

export default class XSettings extends MixinRedux(XElement) {
    html(){
        return `
             <x-card>
                <h2>Settings</h2>
                <span class='setting' show-all-decimals>
                    ${getString('show_all_decimals')}
                    <input type="checkbox">
                    <small>${getString('show_all_decimals_explain')}</small>
                </span>
                <!--
                <span class="setting" visual-lock>
                    ${getString('visual_lock')}
                    <input type="checkbox" disabled>
                    <small>${getString('visual_lock_explain')}</small>
                </span>
                -->
             </x-card>

             <x-card>
                <h2>Advanced</h2>
                <span class="setting" prepared-tx>
                    ${getString('send_prepared_tx')}
                    <small>${getString('send_prepared_tx_explain')}</small>
                </span>
                <span class="setting" remove-persistence>
                    ${getString('delete_cache')}
                    <small>${getString('delete_cache_explain')}</small>
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
            'change [show-all-decimals]>input': this._onClickShowAllDecimals,
            //'click [visual-lock]': this._onClickVisualLock,
            'click [prepared-tx]': () => XSendPreparedTransactionModal.show(),
            'click [remove-persistence]': this._onClickRemovePersistence,
        }
    }

    static get actions() { return { showAllDecimals } }

    _onClickShowAllDecimals(_, e) {
        // Handle click events from the text, but only the change event of the checkbox
        if(e.type === 'click' && e.target.matches('input')) return;
        this.actions.showAllDecimals(!this.settings.showAllDecimals);
    }

    _onClickVisualLock() {
        if (localStorage.lock) {
            const remove = confirm(getString('remove_lock_verify'));
            if (remove) {
                localStorage.removeItem('lock');
                this.$('[visual-lock] input').checked = false;
            }
            return;
        }

        XSettingVisualLockModal.show();
    }

    _onClickRemovePersistence() {
        Store.persist(); // Persist potential changes in contacts

        // Remove regular persistence
        localStorage.removeItem('persistedState');
        // Contacts are not removed on purpose

        window.skipPersistingState = true;
        location.reload();
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
