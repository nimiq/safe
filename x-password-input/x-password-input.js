import XInput from '../x-input/x-input.js';

export default class XPasswordInput extends XInput {
    html() {
        return `
            <form action="/">
                <input type="password" placeholder="Enter Password">
            </form>
        `;
    }

    _validate(value) {
        return value && value.length > 7;
    }

    _onValueChanged() {
      this.fire(this.__tagName + '-change', this.value);
    }
}