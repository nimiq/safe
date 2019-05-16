import XElement from '/libraries/x-element/x-element.js';
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js';
import XAmount from '/elements/x-amount/x-amount.js';
import totalAmount$ from '../selectors/totalAmount$.js';
import { activeWallet$ } from '../selectors/wallet$.js';
import { WalletType } from '../wallet-redux.js';

export default class XTotalAmount extends MixinRedux(XElement) {
    html(){
        return `
            <x-amount white display></x-amount>
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
            totalAmount: totalAmount$(state),
            isLegacy: activeWallet$(state).type === WalletType.LEGACY,
        };
    }

    _onPropertiesChanged(changes) {
        const { totalAmount, isLegacy } = changes;

        if (totalAmount !== undefined) {
            this.value = totalAmount;
        }

        this.$amount.label = isLegacy ? 'Legacy Account Balance' : 'Account Balance';
    }

    set value(value) {
        this.$amount.value = value;
    }
}
