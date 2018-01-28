import XInput from '../x-input/x-input.js';

export default class XPasswordInput extends XInput {
    html() {
        return `
            <form action="/">
                <input type="password" placeholder="Enter Password" required minlength="7">
            </form>
        `;
    }

    _onValueChanged() {
      this.fire(this.__tagName + '-change', this.value);
    }
}