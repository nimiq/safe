import XElement from '../../lib/x-element/x-element.js';
import MixinRedux from '../../elements/mixin-redux.js';
import XSendPreparedTransactionModal from '../x-send-transaction/x-send-prepared-transaction-modal.js';
import { showAllDecimals } from '../../redux/settings-redux.js';
import { Store } from '../../store.js';
import MixinModal from '../mixin-modal/mixin-modal.js';

export default class XSettings extends MixinModal(MixinRedux(XElement)) {
    html(){
        return `
            <div class="modal-header">
                <i x-modal-close class="material-icons">close</i>
                <h2>Settings</h2>
            </div>
            <div class="modal-body">
                <span class="setting" show-all-decimals>
                    Show all decimals
                    <input type="checkbox">
                    <small>Show all five decimals when displaying balances.</small>
                </span>
                <h2 class="advanced">Advanced</h2>
                <span class="setting" prepared-tx>
                    Send prepared transaction
                    <small>Send a transaction that was prepared offline.</small>
                </span>
                <span class="setting" remove-persistence>
                    Delete cached data
                    <small>This does not delete your accounts. It only deletes your transaction history and balances, which will be loaded again from the network.</small>
                </span>
            </div>
        `
    }

    listeners() {
        return {
            'click [show-all-decimals]': this._onClickShowAllDecimals,
            'change [show-all-decimals]>input': this._onClickShowAllDecimals,
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
