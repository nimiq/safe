import XView from '/libraries/x-element/x-view.js';
import XSlides from '../x-slides/x-slides.js';
import XPinpad from '../x-pinpad/x-pinpad.js';
import XWalletBackupImport from '../x-wallet-backup-import/x-wallet-backup-import.js';
import XSuccessMark from '../x-success-mark/x-success-mark.js';

export default class ViewBackupFileImport extends XView {
    html() {
        return `
		<h1>Import Backup File</h1>
		<h2>Select a backup file to import an account</h2>
        <x-slides>
        	<x-wallet-backup-import></x-wallet-backup-import>
        	<x-pinpad></x-pinpad>
        	<x-slide>
        		<x-success-mark></x-success-mark>
            	<h2>Account Imported</h2>
        	</x-slide>
        </x-slides>
        `;
    }
    
    children() { return [XSlides, XWalletBackupImport, XPinpad, XSuccessMark] }

    onCreate() {
        this.addEventListener('x-backup-import', e => this._onWalletImport(e));
        this.addEventListener('x-pin', e => this._onPinEntered(e));
    }

    _onWalletImport(e) {
        e.stopPropagation();
        this._encryptedKey = e.detail;
        this.$slides.next();
        //this._api.decrypt(encryptedPrivateKey);
    }

    _onPinEntered(e) {
        e.stopPropagation();
        const pin = e.detail;
        const result = { pin: pin, encryptedKey: this._encryptedKey }
        this.fire('x-encrypted-wallet', result);
    }

    onPinIncorrect() {
        this.$pinpad.onPinIncorrect();
    }

    onSuccess() {
        this.$slides.next();
        this.$successMark.animate();
    }
}

// Todo: warn user upfront that importing a different account deletes the current account
// Todo: [low priority] support multiple accounts at once