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
}

// Todo: add strength indicator and validator
// Todo: Can we hack that the "save this password" dialog occurs before navigating to a different page?