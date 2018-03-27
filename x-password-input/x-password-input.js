import XInput from '../x-input/x-input.js';

export default class XPasswordInput extends XInput {
    html() {
        const { placeholder } = this.attributes;

        return `
            <form action="/">
                <input class="password" type="password" placeholder="${ placeholder || 'Enter Passphrase' }">
                <span id="eye" icon-eye />
            </form>
        `;
    }

    onCreate() {
        super.onCreate();
        this.$eye = this.$('#eye');
        this.$input = this.$('input');
    }

    listeners() { return {
        'click #eye': e => this._toggleVisibility()
    }}

    _onValueChanged() {
        const { id } = this.attributes;
        if (id) {
            this.fire(`${ this.__tagName }-${ id }-change`, this.value);
        } else {
            this.fire(`${ this.__tagName }-change`, this.value);
        }
    }

    _toggleVisibility() {
        if (this.$input.getAttribute('type') === 'password') {
            this.$input.setAttribute('type', 'text');
            this.$eye.setAttribute('icon-eye-off', true);
            this.$eye.removeAttribute('icon-eye', true);
        } else {
            this.$input.setAttribute('type', 'password');
            this.$eye.setAttribute('icon-eye', true);
            this.$eye.removeAttribute('icon-eye-off', true);
        }
        this.$input.focus();
    }
}
