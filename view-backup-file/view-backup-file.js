import XView from '../../library/x-element/x-view.js';
import XSlides from '../x-slides/x-slides.js';
import XWalletBackup from '../x-wallet-backup/x-wallet-backup.js';

export default class ViewBackupFile extends XView {
    html() {
        return `
            <h1>Backup your Recovery File</h1>
            <x-slides>
                <x-slide>
                    <h2 secondary>Create a password to encrypt your backup file</h2>
                    <input type="password" placeholder="Enter a Password">
                    <x-grow></x-grow>
                    <button>Next</button>
                </x-slide>
                <x-slide>
                    <x-loading-animation></x-loading-animation>
                    <h2>Encrypting Backup</h2>
                </x-slide>
                <x-slide>
                    <h2 secondary>Download your Recovery File to later recover your account</h2>
                    <x-wallet-backup></x-wallet-backup>
                </x-slide>
            </x-slides>
            `
    }

    children() { return [XSlides, XWalletBackup] }

    onCreate() {
        this.$('button').addEventListener('click', e => this.__onPasswordEntered(e.detail))
    }

    reset() {
        this._pin = '';
        this.$pinpads[0].reset();
        this.$pinpads[1].reset();
        this.$slides.slideTo(0);
    }

    __onPasswordEntered(pin) {
        this._pin = pin;
        this.fire('x-export-pin', pin);
        this.$slides.next();
    }

    backup(address, privateKey) {
        this.$walletBackup.backup(address, privateKey);
        setTimeout(() => this.$slides.next(), 1000); // Todo: remove this hack (depends on XWalletBackup)
    }
}

// Todo: start encryption in background right before user re-enters the pin for confirmation