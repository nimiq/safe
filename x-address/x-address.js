import XElement from '/library/x-element/x-element.js';
import Clipboard from '/library/clipboard/clipboard.js';
import XToast from '../x-toast/x-toast.js';

export default class XAddress extends XElement {
    children() { return [XToast] }

    styles() { return ['x-address'] }
    
    onCreate() {
        this.addEventListener('click', e => this._onCopy())
    }

    _onCopy() {
        Clipboard.copy(this.$el.textContent);
        this.$toast.show('Address copied to clipboard!')
    }

    set address(address) {
        this.$el.textContent = address;
    }
}