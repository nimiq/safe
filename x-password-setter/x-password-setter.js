import XPasswordInput from '../x-password-input/x-password-input.js';
import XPasswordIndicator from '../x-password-indicator/x-password-indicator.js';
import XElement from '../../libraries/x-element/x-element.js';

// TODO [sven] make XPasswordSetter listen to state.isWrongPassphrase
// TODO [sven] remove "password too short" hint when pressing return (only when used as password check w/t indicator)

export default class XPasswordSetter extends XElement {
    html() {
        const { buttonLabel, showIndicator } = this.attributes;

        return `
            <x-password-input></x-password-input>
            ${ this.newPassword ? `<x-password-indicator></x-password-indicator>` : '' }
            <div buttons>
                <div button wrong>Wrong passphrase</div>
                <button${ this.newPassword ? ' disabled' : '' }>${ buttonLabel || 'Confirm' }</button>
            </div>
        `;
    }

    onCreate() {
        this.$button = this.$('button');
        const { buttonLabel, showIndicator } = this.attributes;
        this.newPassword = showIndicator && showIndicator !== 'false';
        // TODO is it correct to disable autocompletion and force users to re-enter password?
        this.$('input').setAttribute('autocomplete', this.newPassword ? 'new-password' : 'off');
    }

    children() {
        return [XPasswordInput, XPasswordIndicator];
    }

    types() {
        /** @type {XPasswordInput} */
        this.$passwordInput = null
        /*** @type {XPasswordIndicator} */
        this.$passwordIndicator = null;
    }

    listeners() {
        return {
            'x-password-input-change': value => this._onPasswordUpdate(value),
            'click button': e => this._onPasswordSubmit()
        }
    }

    focus() {
        this.$passwordInput.focus();
    }

    get value() {
        return this.$passwordInput.value;
    }

    /** @param {string} value */
    set value(value) {
        this.$passwordInput.value = value;
    }

    wrongPassphrase() {
        this.$el.classList.toggle('wrong', true);
    }

    _onPasswordUpdate(password) {
        this.$el.classList.toggle('wrong', false);

        if (!this.newPassword) return;

        const strength = this._getPasswordStrength(password);
        this.$passwordIndicator.setStrength(strength);
        if (strength < 3) {
            this.$button.setAttribute('disabled', 'disabled');
        } else {
            this.$button.removeAttribute('disabled');
        }
    }

    _onPasswordSubmit() {
        this.fire(this.__tagName + '-submitted', this.value);
    }

    /** @param {string} password
     * @return {number} */
    _getPasswordStrength(password) {
        if (password.length === 0) return 0;
        if (password.length < 7) return 1;
        if (password.length < 10) return 2;
        if (password.length < 14) return 3;
        return 4;
    }
}
