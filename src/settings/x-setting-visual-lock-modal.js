import XElement from '/libraries/x-element/x-element.js';
import MixinModal from '/elements/mixin-modal/mixin-modal.js';
import XPinpad from '/secure-elements/x-pinpad/x-pinpad.js';
import XToast from '/secure-elements/x-toast/x-toast.js';

export default class XSettingVisualLockModal extends MixinModal(XElement) {
    html() {
        return `
            <div class="modal-header">
                <i x-modal-close class="material-icons">close</i>
                <h2>Set up visual lock</h2>
            </div>
            <div class="modal-body">
                <p>Please enter a PIN to visually lock the Safe:</p>
                <x-pinpad></x-pinpad>
            </div>
        `
    }

    children() { return [ XPinpad ]; }

    listeners() {
        return {
            'x-pin': this._onEnterPin
        }
    }

    onShow() {
        this._pin = null;
        this.$pinpad.open();
    }

    onHide() {
        this.$pinpad.close();
    }

    async _onEnterPin(pin) {
        if (!this._pin) {
            this._pin = pin;
            this.$pinpad.reset();
            XToast.show('Please repeat PIN to confirm');
        } else if (this._pin !== pin) {
            this.$pinpad.onPinIncorrect();
            this._pin = null;
            XToast.error('PIN not matching. Please try again.');
        } else {
            this.fire('x-setting-visual-lock-pin', pin);
        }
    }
}
