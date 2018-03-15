import XPasswordInput from '../x-password-input/x-password-input.js';
import XPasswordIndicator from '../x-password-indicator/x-password-indicator.js';
import XElement from '../../libraries/x-element/x-element.js';



export default class XPasswordSetter extends XElement {
    html() {
        const { buttonLabel, showIndicator } = this.attributes;

        return `
            <x-password-input></x-password-input>
            ${ (showIndicator && showIndicator !== 'false') ? `<x-password-indicator></x-password-indicator>` : '' }
            <button${ showIndicator ? ' disabled' : '' }>${ buttonLabel || 'Confirm' }</button>
        `;
    }

    onCreate() {
        this.$button = this.$('button');
    }

    children() {
        return [XPasswordInput, XPasswordIndicator];
    }

    types() {
        /** @type {XPasswordInput} */
        this.$passwordInput = null;
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

    _onPasswordUpdate(password) {
        if (!this.$passwordIndicator) return;

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
