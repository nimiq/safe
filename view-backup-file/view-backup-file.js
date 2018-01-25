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
                    <button disabled="1">Next</button>
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
        this.$button = this.$('button');
        this.$button.addEventListener('click', e => this._onPasswordInput());
        this.addEventListener('x-wallet-backup-complete', e => this._onWalletBackupComplete());
        this.addEventListener('x-password-input', e => this._onPasswordInput());
        this.addEventListener('x-password-input-valid', e => this._validityChanged(e.detail));
    }

    _validityChanged(valid) {
        if (valid) {
            this.$button.removeAttribute('disabled');
        } else {
            this.$button.setAttribute('disabled', true);
        }
    }

    onShow() {
        this.reset();
    }

    async reset() {
        this.$passwordInput.value = '';
        await this.$slides.slideTo(0);
        this.$passwordInput.focus();
    }

    _onPasswordInput() {
        const password = this.$passwordInput.value;
        this.fire('x-encrypt-backup', password);
        this.$slides.next();
    }

    async backup(address, privateKey) {
        await this.$walletBackup.backup(address, privateKey);
        this.$slides.next();
    }

    async _onWalletBackupComplete() {
        await this.$slides.next();
        await this.$successMark.animate();
        this.fire('x-file-backup-complete');
    }
}