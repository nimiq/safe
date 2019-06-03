import XInput from '../x-input/x-input.js';
import { Utf8Tools } from '../../../node_modules/@nimiq/utils/dist/module/Utf8Tools.js';

export default class XExtraDataInput extends XInput {
    html() {
        return `
            <form>
                <input type="text" placeholder="Message">
                <div class="x-extra-data-info">
                    <div class="x-extra-data-warning nq-orange">Messages are public. Don't enter private information.</div>
                    <p class="x-extra-data-remaining nq-text"></p>
                </div>
            </form>`;
    }

    onCreate() {
        super.onCreate();
        this.$remaining = this.$('.x-extra-data-remaining');
        this._maxBytes = this.attributes.maxBytes || 64;
        this._onValueChanged();
    }

    set valueAsBytes(bytes) {
        super.value = Utf8Tools.utf8ByteArrayToString(bytes); // triggers _onValueChanged
    }

    get valueAsBytes() {
        return Utf8Tools.stringToUtf8ByteArray(this.$input.value);
    }

    set maxBytes(maxBytes) {
        if (maxBytes === this._maxBytes) return;
        this.value = '';
        this._maxBytes = maxBytes;
        this._setRemaining();
    }

    /** @overwrites */
    _onValueChanged() {
        if (!this._validate()) {
            this.value = this._previousValue;
            return;
        }
        this._previousValue = this.value;

        this._setRemaining();
    }

    _setRemaining() {
        const byteLength = this.valueAsBytes.length;
        const bytesRemaining = this._maxBytes - byteLength;
        this.$remaining.textContent = bytesRemaining > 10 ? '' : `${bytesRemaining} bytes remaining`;
        this.fire('x-extra-data-input-changed-size', byteLength);
    }

    _validate() {
        return this.valueAsBytes.length <= this._maxBytes;
    }
}
