class ViewBackupFile extends XView {
    children() { return [XSlides, [XPinpad], XWalletBackup] }

    onCreate() {
        this.$pinpads[0].addEventListener('x-pin', e => this._onPinEntered(e.detail))
        this.$pinpads[1].addEventListener('x-pin', e => this._onPinRentered(e.detail))
    }

    reset() {
        this._pin = '';
        this.$pinpads[0].reset();
        this.$pinpads[1].reset();
        this.$slides.slideTo(0);
    }

    _onPinEntered(pin) {
        this._pin = pin;
        this.$slides.next();
    }

    _onPinRentered(pin) {
        if (this._pin === pin)
            this._onPinCorrect();
        else
            this._onPinIncorrect();
    }

    _onPinCorrect(pin) {
        this.$slides.next();
        this.fire('x-export-pin', pin);
    }

    _onPinIncorrect(pin) {
        this.$pinpads[1].onPinIncorrect();
        setTimeout(() => this.reset(), 500);
    }

    backup(address, privateKey) {
        this.$walletBackup.backup(address, privateKey);
        setTimeout(() => this.$slides.next(), 1000);     // Todo: remove this hack (depends on XWalletBackup)
    }

    html() {
        return `
            <h1>Backup your Recovery File</h1>
            <h2>Download your Recovery File to later recover your account</h2>
            <x-slides>
                <x-pinpad></x-pinpad>
                <x-pinpad></x-pinpad>
                <x-slide>
                    <x-loading-animation></x-loading-animation>
                    <h2>Encrypting Wallet...</h2>
                </x-slide>
                <x-wallet-backup></x-wallet-backup>
            </x-slides>
            
            `
    }

}

// Todo: start encryption in background right before user re-enters the pin for confirmation