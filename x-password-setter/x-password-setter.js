import XPasswordInput from '../x-password-input/x-password-input.js';
import XPasswordIndicator from '../x-password-indicator/x-password-indicator.js';
import XElement from '/libraries/x-element/x-element.js';

export default class XPasswordSetter extends XElement {
    html() {
        const { buttonLabel } = this.attributes;

        return `
            <x-password-input></x-password-input>
            <x-password-input id="confirm" placeholder="Confirm passphrase"></x-password-input>
            <x-password-indicator></x-password-indicator>
            <button disabled>${ buttonLabel || 'Confirm' }</button>
        `;
    }

    onCreate() {
        this.$button = this.$('button');
        // TODO is it correct to disable autocompletion and force users to re-enter password?
        this.$('input').setAttribute('autocomplete', 'new-password');
    }

    children() {
        return [ XPasswordInput, XPasswordIndicator];
    }

    listeners() {
        return {
            'x-password-input-change': value => this._onPasswordUpdate(value),
            'x-password-input-confirm-change': value => this._onPasswordConfirmUpdate(value),
            'click button': e => this._onPasswordSubmit(),
            'keydown input': (d, e) => { if (e.keyCode == 13) this._onPasswordSubmit() }
        }
    }

    focus() {
        this.$passwordInput[0].focus();
    }

    get value() {
        return this.$passwordInput[0].value;
    }

    _onPasswordUpdate(password) {
        const strength = this._getPasswordStrength(password);
        this.$passwordIndicator.setStrength(strength);
        this._password1 = password;
        this._checkPasswords();

    }

    _onPasswordConfirmUpdate(password) {
        this._password2 = password;
        this._checkPasswords();
    }

    _checkPasswords() {
        const strength = this._getPasswordStrength(this._password1);
        if (strength < 3 || this._password1 !== this._password2) {
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
