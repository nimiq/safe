import XPasswordInput from '../x-password-input/x-password-input.js';
import XPasswordIndicator from '../x-password-indicator/x-password-indicator.js';
import XElement from '../../library/x-element/x-element.js';
export default class XPasswordSetter extends XElement {
    html() {
        return `
            <x-password-input></x-password-input>
            <x-password-indicator></x-password-indicator>
        `;
    }

    // styles() { return ['center'] }

    types() {
        /** @type {XPasswordInput} */
        this.$passwordInput = null;
        /*** @type {XPasswordIndicator} */
        this.$passwordIndicator = null;
    }

    children() {
      return [XPasswordInput, XPasswordIndicator];
    }

    onCreate() {
      this.addEventListener('x-password-input-change', e => this._onPasswordUpdate(e.detail));
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
      this.fire(this.__tagName + '-valid', strength === 3);
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

// Todo: Can we hack that the "save this password" dialog occurs before navigating to a different page?