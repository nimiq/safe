class ViewPinCreate extends XElement {
    children() { return [XPinpad] }

    onApiReady(api) {
        this._api = api;
        if (!this.$pinpad.unlocking) return;
        this._encrypt(); // Submit again because api wasn't ready yet
    }

    onShow() {
        this.reset();
    }

    onCreate() {
        this.addEventListener('x-pin', e => this._submit(e.detail));
    }

    _reset() {
        this.$el.removeAttribue('verify');
        this.$pinpad.reset();
    }

    _submit(pin) {
        if (!this._pin) return this._entered();
        this._verified(pin);
    }

    _entered(pin) {
        this._pin = pin;
        this.$el.setAttribute('verify', true)
        setTimeout(e => {
            this.$pinpad.reset();
        }, 500)
    }

    _verified(pin) {
        if (this._pin !== pin) return this.$pinpad.onPinIncorrect();
        this._encrypt();
        return true;
    }

    _encrypt() {
        if (!this._api) return;
        this._api.encryptWallet(this._pin)
            .then(success => this._success())
    }

    _success() {

    }

    html(){
        return `
        <h1>Create a Passcode</h1>
        <h2>A passcode protects your funds and is used to unlock your Wallet</h2>
        <x-pinpad></x-pinpad>`
    }
}