import XView from '/library/x-element/x-view.js';
import XSlides from '../x-slides/x-slides.js';
import XWalletBackupImport from '../x-wallet-backup-import/x-wallet-backup-import.js';
import XSuccessMark from '../x-success-mark/x-success-mark.js';

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
                <input type="password" placeholder="Enter your Password">
                <x-grow></x-grow>
                <button>Unlock</button>
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

    children() { return [XSlides, XWalletBackupImport, XSuccessMark] }

    onCreate() {
        this.$input = this.$('input[type="password"]');
        this.addEventListener('x-backup-import', e => this._onWalletImport(e));
        this.$('button').addEventListener('click', e => this._onPasswordEntered(e));
    }

    onShow() {
        this.$slides.jumpTo(0);
    }

    _onWalletImport(e) {
        e.stopPropagation();
        this._encryptedKey = e.detail;
        this.$slides.next();
    }

    _onPasswordEntered(e) {
        const password = this.$input.value;
        const result = { password: password, encryptedKey: this._encryptedKey }
        this.fire('x-decrypt-backup', result);
        this.$slides.next();
    }

    onPasswordIncorrect() {
        this.$slides.prev();
        this.animate('shake', this.$input);
    }

    onSuccess() {
        this.$slides.next();
        this.$successMark.animate();
    }
}

// Todo: warn user upfront that importing a different account deletes the current account
// Todo: [low priority] support multiple accounts at once