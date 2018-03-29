import XElement from '/libraries/x-element/x-element.js';
import NanoApi from '/libraries/nano-api/nano-api.js';
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js';
import XAmount from '/elements/x-amount/x-amount.js';

export default class XTotalAmount extends MixinRedux(XElement) {
    html(){
        return `
            <x-amount white display label="Total balance"></x-amount>
        `
    }

    children() {
        return [ XAmount ];
    }

    onCreate(){
        this.$currencyNim = this.$('x-currency-nim');
        super.onCreate();
    }

    static mapStateToProps(state) {
        return {
            accounts: state.accounts.entries,
            hasContent: state.accounts.hasContent
        };
    }

    _onPropertiesChanged(changes) {
        const { hasContent, accounts } = this.properties;

        if (!hasContent) return;

        if (accounts.size === 0) {
            this.value = 0;
            return;
        }

        const value = [...accounts.values()].reduce((acc, account) => acc + account.balance, 0);

        // Only update when all accounts have their balance loaded
        if (!isNaN(value)) this.value = value;
    }

    set value(value) {
        this.$amount.value = value;
    }
}
