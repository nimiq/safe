import XPasswordInput from '../x-password-input/x-password-input.js';
import XPasswordIndicator from '../x-password-indicator/x-password-indicator.js';
import XElement from '/libraries/x-element/x-element.js';

export default class XPasswordGetter extends XElement {
    html() {
        const { buttonLabel } = this.attributes;

        return `
            <x-password-input></x-password-input>
            <x-grow></x-grow>
            <button>${ buttonLabel || 'Confirm' }</button>
        `;
    }

    onCreate() {
        this.$button = this.$('button');
        // TODO is it correct to disable autocompletion and force users to re-enter password?
        this.$('input').setAttribute('autocomplete', 'off');
    }

    children() {
        return [ XPasswordInput, XPasswordIndicator];
    }

    listeners() {
        return {
            'click button': e => this._onPasswordSubmit(),
            'keydown input': (d, e) => { if (e.keyCode == 13) this._onPasswordSubmit() }
        }
    }

    focus() {
        this.$passwordInput.focus();
    }

    wrongPassphrase() {
        this.$passwordInput.setInvalid();
    }


    get value() {
        return this.$passwordInput.value;
    }

    _onPasswordSubmit() {
        this.fire(this.__tagName + '-submitted', this.value);
    }
}
