import XPasswordInput from '../x-password-input/x-password-input.js';
import XPasswordIndicator from '../x-password-indicator/x-password-indicator.js';
import XElement from '../../library/x-element/x-element.js';
export default class XPasswordSetter extends XElement {
    html() {
        return `
            <form action="/">
                <x-password-input></x-password-input>
                <x-password-indicator></x-password-indicator>
            </form>
        `;
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

    set value(value) {
      this.$passwordInput.value = value;
    }

    _onPasswordUpdate(value) {
      this.$passwordIndicator.setPassword(value)
      this.fire(this.__tagName + '-valid', this._isGoodPassword(value));
    }

    _isGoodPassword(password) {
      return password.length > 7;
    }
}


// Todo: add strength indicator and validator
// Todo: Can we hack that the "save this password" dialog occurs before navigating to a different page?