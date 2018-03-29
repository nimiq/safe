import XElement from '/libraries/x-element/x-element.js';
import Clipboard from '/libraries/nimiq-utils/clipboard/clipboard.js';
import XToast from '../../secure-elements/x-toast/x-toast.js';
import ValidationUtils from '/libraries/secure-utils/validation-utils/validation-utils.js';

export default class XAddress extends XElement {
    styles() { return ['x-address'] }

    listeners() {
        return {
            'click': this._onCopy
        }
    }

    _onCopy() {
        Clipboard.copy(this.$el.textContent);
        XToast.show('Account number copied to clipboard!')
    }

    set address(address) {
        if (ValidationUtils.isValidAddress(address)) {
            this.$el.textContent = address;
        } else {
            this.$el.textContent = '';
        }
    }
}
