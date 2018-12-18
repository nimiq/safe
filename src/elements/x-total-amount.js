import XElement from '/libraries/x-element/x-element.js';
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js';
import XAmount from '/elements/x-amount/x-amount.js';
import totalAmount$ from '../selectors/totalAmount$.js';

export default class XTotalAmount extends MixinRedux(XElement) {
    html(){
        return `
            <x-amount white display label="Account balance"></x-amount>
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
            totalAmount: totalAmount$(state)
        };
    }

    _onPropertiesChanged(changes) {
        const { totalAmount } = changes;

        if (totalAmount !== undefined) {
            this.value = totalAmount;
        }
    }

    set value(value) {
        this.$amount.value = value;
    }
}
