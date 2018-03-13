import XPasswordInput from '../x-password-input/x-password-input.js';
import XPasswordIndicator from '../x-password-indicator/x-password-indicator.js';
import XElement from '../../libraries/x-element/x-element.js';

export default class XPasswordSetter extends XElement {
    html() {
        const buttonLabel = this.$el.getAttribute('buttonLabel') || 'Confirm';
        const showIndicator = this.$el.getAttribute('showIndicator') === 'true';

        return `
            <x-password-input></x-password-input>
            ${ showIndicator && `<x-password-indicator></x-password-indicator>` }
            <button disabled="true">${buttonLabel}</button>
        `;
    }

    children() {
        return [XPasswordInput, XPasswordIndicator];
    }

    types() {
        /** @type {XPasswordInput} */
        this.$passwordInput = null;
        /*** @type {XPasswordIndicator} */
        this.$passwordIndicator = null;
        this.$button = this.$('button');
    }

    listeners() {
        return {
            'x-password-input-change': '_onPasswordUpdate'
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

    _onPasswordUpdate(value) {
        const strength = this._getPasswordStrength(value);
        this.$passwordIndicator.setStrength(strength);
        if (strength >= 3) {
            this.$button.setAttribute('disabled', 'false');
            this.fire(this.__tagName + '-valid');
        } else {
            this.$button.setAttribute('disabled', 'true');
        }
    }

    /** @param {string} password
     * @return {number} */
    _getPasswordStrength(password) {
        if (password.length === 0) return 0;
        if (password.length < 5) return 1;
        if (password.length < 10) return 2;
        return 3;
    }
}
