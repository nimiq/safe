import XElement from '/libraries/x-element/x-element.js';

export default class XInput extends XElement {
    styles() { return ['x-input'] }

    onCreate() {
        this.$input = this.$('input');

        if (this.attributes.name) {
            this.$input.setAttribute('name', this.attributes.name);
        }

        this.$input.addEventListener('input', e => this.__onInput(e)); // Note: this doens't work with checkbox or radio button
        this.$input.addEventListener('keypress', e => this.__onKeypress(e));
        this.$input.addEventListener('input', e => this.__onValueChanged(e));
        this.$input.addEventListener('keyup', e => this.__onValueChanged(e));

        this.$form = this.$('form');

        if (this.$form){
            this.$form.addEventListener('submit', e => this._onSubmit(e));
        }

        this._autoSubmit = this.$el.hasAttribute('auto-submit');
        this._oldValue = this.$input.value;
    }

    get value() {
        return this.$input.value;
    }

    set value(value) {
        this._oldValue = this.$input.value;
        this.$input.value = value;
        if (value !== this._oldValue) {
            // Dispatch actual input event on input DOM node
            var event = new Event('input', {
                'bubbles': true,
                'cancelable': true
            });
            this.$input.dispatchEvent(event);

            this._onValueChanged();
        }
    }

    _onSubmit(e) {
        e.preventDefault();
        e.stopPropagation();
        this._submit();
    }

    __onValueChanged(e) {
        if (this._oldValue === this.$input.value) return;
        this._oldValue = this.$input.value;
        if (this._autosubmit) this._submit();
        this._onValueChanged(e);
        this._notifyValidity();
    }

    __onInput(e) {}

    __onKeyup(e) {}

    __onKeypress(e) {}

    _onValueChanged() {}

    _submit() {
        if (!this._validate(this.value)) return;
        requestAnimationFrame(_ => this.fire(this.__tagName, this.value)); // Hack to hide keyboard on iOS even after paste
    }

    focus() {
        requestAnimationFrame(_ => this.$input.focus());
    }

    setInvalid() {
        this._onInvalid();
    }

    async _onInvalid() {
        await this.animate('shake');
        this.value = '';
    }

    _validate() { return this.$input.checkValidity(); }

    _notifyValidity() {
        const isValid = this._validate(this.value);
        this.fire(this.__tagName + '-valid', isValid);
    }
}

// Note: If you override a setter you need to override the getter, too.
// See: https://stackoverflow.com/questions/28950760/override-a-setter-and-the-getter-must-also-be-overridden
