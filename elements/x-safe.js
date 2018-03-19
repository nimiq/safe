import XElement from '/libraries/x-element/x-element.js';
import XRouter from '/elements/x-router/x-router.js';
import XSafeStart from './x-safe-start.js';
import XAccounts from './x-accounts.js';
import XTransactions from './x-transactions.js';
import XToast from '/elements/x-toast/x-toast.js';
import keyguardPromise from '../keyguard.js';
import reduxify from '/libraries/redux/src/redux-x-element.js';
import store from '../store/store.js'
import { addAccount } from '../store/accounts.js';

class XSafe extends XElement {

    html() {
        return `
            <x-router>
                <main x-route="success">Success!</main>
                <main x-route="error">Error</main>
                <x-identicons x-route="new-account"></x-identicons>
                <x-import-file x-route="import-from-file"> Import via backup file</x-import-file>
                <main x-route="sign"> New Transaction</main>
                <main x-route="vesting"> Vesting contracts</main>
                <x-safe-start x-route="/"></x-safe-start>
            </x-router>
            <br><br>
            <h2>Your Accounts</h2>
            <x-accounts></x-accounts>
            <br><br>
            <h2>Recent Transactions</h2>
            <x-transactions></x-transactions>
            `
    }

    children() {
        return [ XRouter, XSafeStart, XAccounts, XTransactions ];
    }

    listeners() {
        return {
            'x-accounts-create': () => this._startCreate(),
            'x-accounts-import': () => this._startImportFile(),
            // 'x-account-selected': address => XRouter.root.goTo('account/' + address),
            // 'click button#import-words': () => this._startImportWords(),
            // 'click button#export': () => this._startExport(),
        }
    }

    async _startCreate() {
        const keyguard = await keyguardPromise;
        const newKey = await keyguard.create();
        this.$accounts.addAccount(newKey);
        console.log('Got new key:', newKey);
        // todo: create account access file
        this.actions.addAccount(newKey);
    }

    async _startImportFile() {
        // todo: read account access file
        const keyguard = await keyguardPromise;
        const newKey = await keyguard.importFromFile('12e1e112e12e12e12e12e21e');
        this.$accounts.addAccount(newKey);
        console.log('Got new key:', newKey);
    }

    async _startImportWords() {
        const keyguard = await keyguardPromise;
        const newKey = await keyguard.importFromWords();
        console.log(`Got new key ${JSON.stringify(newKey)}`);
        // done
    }

    async _startExport() {
        const keyguard = await keyguardPromise;
        const encKey = await keyguard.exportKey('');
        console.log(`Encrypted private key ${JSON.stringify(encKey)}`);
        // todo: create account access file
    }
}

export default reduxify(
    store,
    null,
    { addAccount }
)(XSafe)


// TODO catch errors in a top level error panel catching all previously uncaught exceptions > XApp?
