import XInput from '../x-input/x-input.js';
export default class XPasswordInput extends XInput {
    html() {
        return `
            <form action="/">
                <input type="password" placeholder="Enter Password">
            </form>
        `;
    }

    onValue() {
        this.fire('x-password-entered');
    }

    _validate(value) {
        return true;
    }
}



// Todo: add strength indicator
// Todo: Can we hack that the "save this password" dialog occurs before navigating to a different page?