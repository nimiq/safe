import XInput from '../x-input/x-input.js';

export default class XPasswordInput extends XInput {
    html() {
        return `
            <form action="/">
                <input class="password" type="password" placeholder="Enter Password" required minlength="10">
                <span id="eye" icon-eye />
            </form>
        `;
    }

    onCreate() {
        super.onCreate();
        this.$eye = this.$('#eye');
        this.$input = this.$('input');
        this.$eye.addEventListener('click', e => this._toggleVisibility());
    }

    _onValueChanged() {
      this.fire(this.__tagName + '-change', this.value);
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