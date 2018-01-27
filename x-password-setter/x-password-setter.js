import XPasswordInput from '../x-password-input/x-password-input.js';
import XPasswordIndicator from '../x-password-indicator/x-password-indicator.js';
import XInput from '../x-input/x-input.js';
export default class XPasswordSetter extends XInput {
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

    _onPasswordUpdate(value) {
      this.$passwordIndicator.setPassword(value)
    }

    _validate(value) {
      return this.$passwordIndicator._validate(value)
    }
}

// Todo: add strength indicator and validator
// Todo: Can we hack that the "save this password" dialog occurs before navigating to a different page?