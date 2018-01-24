import XElement from '/library/x-element/x-element.js';

export default class XPasswordInput extends XElement {
    html() {
        return `
			<form action="/">
				<input type="password" placeholder="Enter Password">
			</form>
		`;
    }

    onCreate() {
        this.$input = this.$('input');
        this.$('form').addEventListener('submit', e => this._onSubmit(e));
    }

    get value() {
        this.$input.value;
    }

    set value(value) {
        this.$input.value = value;
    }

    _onSubmit(e) {
        e.preventDefault();
        e.stopPropagation();
        this._onPasswordEntered();
    }

    _onPasswordEntered() {
    	this.$input.blur();
        this.fire('x-password-entered');
    }

    focus() {
        this.$input.focus();
    }

    async onWrong(){
    	await this.animate('shake');
    	this.value = '';
    }
}

// Todo: add strength indicator