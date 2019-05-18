import { ValidationUtils } from '@nimiq/utils';
import XElement from '../../lib/x-element/x-element.js';
import Clipboard from '../../lib/clipboard.js';
import XToast from '../x-toast/x-toast.js';

export default class XAddress extends XElement {
    styles() { return ['x-address'] }

    listeners() {
        return {
            'click': this._onCopy
        }
    }

    _onCopy() {
        Clipboard.copy(this.$el.textContent);
        XToast.show('Address copied to clipboard!')
    }

    set address(address) {
        if (ValidationUtils.isValidAddress(address)) {
            this.$el.textContent = address;
        } else {
            this.$el.textContent = '';
        }
    }
}
