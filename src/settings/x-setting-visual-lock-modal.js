import XElement from '/libraries/x-element/x-element.js';
import MixinModal from '/elements/mixin-modal/mixin-modal.js';
import PatternLock from '/libraries/patternLock/patternLock.js';
import XToast from '/secure-elements/x-toast/x-toast.js';

export default class XSettingVisualLockModal extends MixinModal(XElement) {
    html() {
        return `
            <div class="modal-header">
                <i x-modal-close class="material-icons">close</i>
                <h2>Set up visual lock</h2>
            </div>
            <div class="modal-body">
                <p>Draw a pattern to visually lock the Safe:</p>
                <div id="setting-patternLock"></div>
            </div>
        `
    }

    onCreate() {
        super.onCreate();
        this.lock = new PatternLock("#setting-patternLock", {
            mapper: {1: 3, 2: 8, 3: 4, 4: 2, 5: 9, 6: 7, 7: 5, 8: 1, 9: 6},
            onDraw: this._onEnterPin.bind(this)
        });
    }

    onShow() {
        this._pin = null;
        this.lock.reset();
    }

    onHide() {
        this.lock.reset();
    }

    async _onEnterPin(pin) {
        pin = this._hash(pin);
        if (!this._pin) {
            this._pin = pin;
            this.lock.reset();
            XToast.show('Please repeat pattern to confirm');
        } else if (this._pin !== pin) {
            this.lock.error();
            setTimeout(this.lock.reset.bind(this.lock), 500);
            this._pin = null;
            XToast.error('Pattern not matching. Please try again.');
        } else {
            this.fire('x-setting-visual-lock-pin', pin);
        }
    }

    _hash(text) {
        return ('' + text
                .split('')
                .map(c => Number(c.charCodeAt(0)) + 3)
                .reduce((a, e) => a * (1 - a) * this.__chaosHash(e), 0.5))
            .split('')
            .reduce((a, e) => e + a, '')
            .substr(4, 17);
    }

    __chaosHash(number) {
        const k = 3.569956786876;
        let a_n = 1 / number;
        for (let i = 0; i < 100; i++) {
            a_n = (1 - a_n) * a_n * k;
        }
        return a_n;
    }
}
