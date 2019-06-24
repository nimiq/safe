import XElement from '../../lib/x-element/x-element.js';

export default class XInput extends XElement {
    protected $input!: HTMLInputElement;
    protected _oldValue!: string;

    public get value(): string {
        return this.$input.value;
    }

    public set value(value: string) {
        this._oldValue = this.$input.value;
        this.$input.value = value;
        if (value !== this._oldValue) {
            // Dispatch actual input event on input DOM node
            const event = new Event('input', {
                bubbles: true,
                cancelable: true,
            });
            this.$input.dispatchEvent(event);

            this._onValueChanged();
        }
    }

    public focus() {
        requestAnimationFrame(() => this.$input.focus());
    }

    protected styles() { return ['x-input']; }

    protected onCreate() {
        const input = this.$('input');
        if (!(input instanceof HTMLInputElement)) {
            throw new Error('x-input requires an input to work on.');
        }
        this.$input = input;

        if (this.attributes.name) {
            this.$input.setAttribute('name', this.attributes.name);
        }

        // Note: this doens't work with checkbox or radio button
        this.$input.addEventListener('input', (e) => this.__onInput(e));
        this.$input.addEventListener('keypress', (e) => this.__onKeypress(e));
        this.$input.addEventListener('input', (e) => this.__onValueChanged(e));
        this.$input.addEventListener('keyup', (e) => this.__onValueChanged(e));

        const form = this.$('form');
        if (form) {
            form.addEventListener('submit', (e) => this._onSubmit(e));
        }

        this._oldValue = this.$input.value;
    }

    protected _onSubmit(e: Event) {
        e.preventDefault();
        e.stopPropagation();
        this._submit();
    }

    protected __onValueChanged(e: Event) {
        if (this._oldValue === this.$input.value) return;
        this._oldValue = this.$input.value;
        this._onValueChanged(e);
        this._notifyValidity();
    }

    // tslint:disable:no-empty
    protected __onInput(e: Event) {}
    protected __onKeyup(e: Event) {}
    protected __onKeypress(e: Event) {}
    protected _onValueChanged(e?: Event) {}
    // tslint:enable:no-empty

    protected _submit() {
        if (!this._validate(this.value)) return;
        // Hack to hide keyboard on iOS even after paste
        requestAnimationFrame(() => this.fire((this.constructor as typeof XElement).tagName, this.value));
    }

    protected async _onInvalid() {
        await this.animate('shake');
        this.value = '';
    }

    protected _validate(value: string) { return this.$input.checkValidity(); }

    protected _notifyValidity() {
        const isValid = this._validate(this.value);
        this.fire((this.constructor as typeof XElement).tagName + '-valid', isValid);
    }
}

// Note: If you override a setter you need to override the getter, too.
// See: https://stackoverflow.com/questions/28950760/override-a-setter-and-the-getter-must-also-be-overridden
