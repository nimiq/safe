import XView from '../../library/x-element/x-view.js';
import XSlides from '../x-slides/x-slides.js';
import XSuccessMark from '../x-success-mark/x-success-mark.js';
import XWalletBackup from '../x-wallet-backup/x-wallet-backup.js';

export default class ViewBackupFile extends XView {
    html() {
        return `
            <h1>Backup your Recovery File</h1>
            <x-slides>
                <x-slide>
                    <h2 secondary>Create a password to encrypt your backup file. Make sure you memorize it well because there is no way to recover it.</h2>
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
                    <x-grow></x-grow>
                </x-slide>
                <x-slide>
                    <x-success-mark></x-success-mark>
                    <h2>Backup Complete</h2>
                </x-slide>
            </x-slides>
            `
    }

    children() { return [XSlides, XWalletBackup, XSuccessMark] }

    onCreate() {
        this.$input = this.$('input[type="password"]');
        this.$('button').addEventListener('click', e => this._onPasswordEntered());
        this.addEventListener('x-wallet-backup-complete', e => this._onWalletBackupComplete());
    }

    onShow() {
        this.reset();
    }

    reset() {
        this.$input.value = '';
        this.$input.focus();
        this.$slides.slideTo(0);
    }

    _onPasswordEntered() {
        const password = this.$input.value;
        this.fire('x-encrypt-backup', password);
        this.$slides.next();
    }

    backup(address, privateKey) {
        this.$walletBackup.backup(address, privateKey);
        setTimeout(() => this.$slides.next(), 1000); // Todo: remove this hack (depends on XWalletBackup)
    }

    _onWalletBackupComplete() {
        this.$slides.next()
            .then(e => this.$successMark.animate())
            .then(e => this.fire('x-file-backup-complete'));
    }
}

// Todo: start encryption in background right before user re-enters the pin for confirmation