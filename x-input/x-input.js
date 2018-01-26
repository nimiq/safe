import XElement from '/library/x-element/x-element.js';

export default class XInput extends XElement {
    styles() { return ['x-input'] }

    onCreate() {
        this.$input = this.$('input');
        this.$input.addEventListener('input', e => this.__onValueChanged(e));
        this.$input.addEventListener('keyup', e => this.__onValueChanged(e));
        this.$form = this.$('form');
        if (this.$form) this.$form.addEventListener('submit', e => this._onSubmit(e));
    }

    get value() {
        return this.$input.value;
    }

    set value(value) {
        this.$input.value = value;
        this.__onValueChanged();
    }

    _onSubmit(e) {
        e.preventDefault();
        e.stopPropagation();
        this._submit();
    }

    __onValueChanged() {
        if (this._autosubmit) this._submit();
        this._notifyValidity();
        if (this._onValueChanged) this._onValueChanged();
    }

    _submit() {
        if (!this._validate(this.value)) return;
        this.$input.blur();
        this.fire(this.__tagName, this.value);
    }

    focus() {
        requestAnimationFrame(_ => this.$input.focus());
    }

    async _onInvalid() {
        await this.animate('shake');
        this.value = '';
    }

    _validate() { return true; }

    get _autosubmit() { return false; }

    _notifyValidity() {
        const isValid = this._validate(this.value);
        this.fire(this.__tagName + '-valid', isValid);
    }
}

// Note: If you override a setter you need to override the getter, too.
// See: https://stackoverflow.com/questions/28950760/override-a-setter-and-the-getter-must-also-be-overridden