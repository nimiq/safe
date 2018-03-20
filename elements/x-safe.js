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
            <header>
                <div class="header-top">
                    <div class="nimiq-app-name">
                        <nimiq-logo>NIMIQ <strong>SAFE</strong></nimiq-logo>
                    </div>
                    <nav class="secondary-links">
                        <a href="https://nimiq.com">Homepage</a>
                        <a href="https://nimiq.com/explorer">Explorer</a>
                    </nav>
                </div>
                <x-amount>Total Amount: #todo</x-amount>
                <div class="header-bottom">
                    <nav class="main">
                        <a href="#dashboard">Dashboard</a>
                        <a href="#transactions">Transactions</a>
                        <a href="#settings">Settings</a>
                    </nav>
                    <nav class="actions">
                        <a>Receive</a>
                        <a>Send</a>
                    </nav>
                </div>
            </header>
            <section class="content">
                <x-router>
                    <x-import-file x-route="import-from-file"> Import via backup file</x-import-file>
                    <main x-route="sign"> New Transaction</main>
                    <main x-route="vesting"> Vesting contracts</main>
                    <x-view-dashboard route="dashboard">
                        <x-card>
                            <h2>Recent Transactions</h2>
                            <x-transactions></x-transactions>
                        </x-card>
                        <x-card style="max-width: 500px;">
                            <h2>Your Accounts</h2>
                            <x-accounts></x-accounts>
                        </x-card>
                    </x-view-dashboard>
                    <x-view-transactions route="transactions"></x-view-transactions>
                    <x-view-settings route="settings"></x-view-settings>
                </x-router>
            </section>
            <footer>
                &copy; 2017-2018 Nimiq Foundation
            </footer>
            `
    }

    children() {
        return [ XRouter, XAccounts, XTransactions ];
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
