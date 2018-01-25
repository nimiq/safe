import XView from '/library/x-element/x-view.js';
import XSlides from '../x-slides/x-slides.js';
import XWalletBackupImport from '../x-wallet-backup-import/x-wallet-backup-import.js';
import XSuccessMark from '../x-success-mark/x-success-mark.js';
import XPasswordInput from '../x-password-input/x-password-input.js';

export default class ViewBackupFileImport extends XView {
    html() {
        return `
        <h1>Import Backup File</h1>
        <x-slides>
            <x-slide>
                <h2 secondary>Select a backup file to import an account</h2>
                <x-wallet-backup-import></x-wallet-backup-import>
            </x-slide>
            <x-slide>
                <h2 secondary>Enter the password to unlock this backup</h2>
                <x-password-input></x-password-input>
                <x-grow></x-grow>
                <button disabled="yes">Unlock</button>
            </x-slide>
            <x-slide>
                <x-loading-animation></x-loading-animation>
                <h2>Unlocking the Backup</h2>
            </x-slide>
            <x-slide>
                <x-success-mark></x-success-mark>
                <h2>Account Imported</h2>
            </x-slide>
        </x-slides>
        `;
    }

    children() { return [XSlides, XWalletBackupImport, XSuccessMark, XPasswordInput] }

    onCreate() {
        this.addEventListener('x-backup-import', e => this._onWalletImport(e));
        this.$button = this.$('button');
        this.$button.addEventListener('click', e => this._onPasswordInput(e));
        this.addEventListener('x-password-input', e => this._onPasswordInput());
        this.addEventListener('x-password-input-valid', e => this._validityChanged(e.detail));
    }

    _validityChanged(valid) {
        if (valid) 
            this.$button.removeAttribute('disabled');
        else 
            this.$button.setAttribute('disabled', true);
    }

    onShow() {
        this.$slides.jumpTo(0);
    }

    async _onWalletImport(e) {
        e.stopPropagation();
        this._encryptedKey = e.detail;
        await this.$slides.next()
        this.$passwordInput.focus();
    }

    _onPasswordInput() {
        const password = this.$passwordInput.value;
        const result = { password: password, encryptedKey: this._encryptedKey }
        this.fire('x-decrypt-backup', result);
        this.$slides.next();
    }

    async onPasswordIncorrect() {
        await this.$slides.prev();
        this.$passwordInput.onWrong();
        this.$button.setAttribute('disabled', true);
    }

    async onSuccess() {
        await this.$slides.next();
        await this.$successMark.animate();
    }
}

// Todo: warn user upfront that importing a different account deletes the current account
// Todo: [low priority] support multiple accounts at once