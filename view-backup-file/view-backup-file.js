import XView from '../../library/x-element/x-view.js';
import XSlides from '../x-slides/x-slides.js';
import XSuccessMark from '../x-success-mark/x-success-mark.js';
import XWalletBackup from '../x-wallet-backup/x-wallet-backup.js';
import XPasswordInput from '../x-password-input/x-password-input.js';

export default class ViewBackupFile extends XView {
    html() {
        return `
            <h1>Backup your Recovery File</h1>
            <x-slides>
                <x-slide>
                    <h2 secondary>Create a password to encrypt your backup file. Make sure you memorize it well because there is no way to recover it.</h2>
                    <x-password-input></x-password-input>
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

    children() { return [XSlides, XWalletBackup, XSuccessMark, XPasswordInput] }

    onCreate() {
        this.$('button').addEventListener('click', e => this._onPasswordEntered());
        this.addEventListener('x-wallet-backup-complete', e => this._onWalletBackupComplete());
        this.addEventListener('x-password-entered', e => this._onPasswordEntered());
    }

    onShow() {
        this.reset();
    }

    async reset() {
        this.$passwordInput.value = '';
        await this.$slides.slideTo(0);
        this.$passwordInput.focus();
    }

    _onPasswordEntered() {
        const password = this.$passwordInput.value;
        this.fire('x-encrypt-backup', password);
        this.$slides.next();
    }

    backup(address, privateKey) {
        this.$walletBackup.backup(address, privateKey);
        setTimeout(() => this.$slides.next(), 1000); // Todo: remove this hack (depends on XWalletBackup)
    }

    async _onWalletBackupComplete() {
        await this.$slides.next();
        await this.$successMark.animate();
        this.fire('x-file-backup-complete');
    }
}