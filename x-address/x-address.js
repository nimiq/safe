import XElement from '/libraries/x-element/x-element.js';
import Clipboard from '/libraries/nimiq-utils/clipboard/clipboard.js';
import XToast from '../x-toast/x-toast.js';
import NanoApi from '/libraries/nano-api/nano-api.js';

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
        if (NanoApi.validateAddress(address)) {
            this.$el.textContent = address;
        } else {
            this.$el.textContent = '';
        }
    }
}
