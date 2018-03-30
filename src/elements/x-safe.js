import XElement from '/libraries/x-element/x-element.js';
import XRouter from '/secure-elements/x-router/x-router.js';
import { addAccount } from '/elements/x-accounts/accounts-redux.js';
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js';
import XTotalAmount from './x-total-amount.js';
import XNetworkIndicator from '/elements/x-network-indicator/x-network-indicator.js';
import networkClient from '../network-client.js';
import XSendTransactionModal from '/elements/x-send-transaction/x-send-transaction-modal.js';
import XSendTransactionOfflineModal from '/elements/x-send-transaction/x-send-transaction-offline-modal.js';
import XSendPreparedTransactionModal from '/elements/x-send-transaction/x-send-prepared-transaction-modal.js';
import XToast from '/secure-elements/x-toast/x-toast.js';
import accountManager from '/libraries/account-manager/account-manager.js';
import XAccounts from '/elements/x-accounts/x-accounts.js';
import XTransactions from '/elements/x-transactions/x-transactions.js';
import XTransactionModal from '/elements/x-transactions/x-transaction-modal.js';
import XReceiveRequestLinkModal from '/elements/x-request-link/x-receive-request-link-modal.js';
import XCreateRequestLinkModal from '/elements/x-request-link/x-create-request-link-modal.js';
import XWelcomeModal from './x-welcome-modal.js';
import { spaceToDash } from '/libraries/nimiq-utils/parameter-encoding/parameter-encoding.js';
import config from '../config.js';

export default class XSafe extends MixinRedux(XElement) {

    html() {
        return `
            <header>
                <div class="header-top">
                    <div class="nimiq-app-name">
                        <nimiq-logo>NIMIQ <strong>SAFE</strong></nimiq-logo>
                    </div>
                    <nav class="secondary-links">
                        <a href="https://nimiq.com">Homepage</a>
                        <!-- <a href="https://medium.com/nimiq-network">Blog</a> -->
                        <!-- <a href="https://nimiq.com/explorer">Explorer</a> -->
                    </nav>
                </div>
                <x-total-amount></x-total-amount>
                <div class="header-bottom">
                    <nav class="actions">
                        <button class="small" new-tx>Send NIM</button>
                        <button class="small" receive>Receive NIM</button>
                        <x-send-transaction-modal x-route-aside="new-transaction"></x-send-transaction-modal>
                    </nav>
                    <nav class="main">
                        <a x-href="">Dashboard</a>
                        <a x-href="history">History</a>
                        <!-- <a x-href="settings">Settings</a> -->
                    </nav>
                </div>
            </header>
            <section class="content nimiq-dark">
                <x-view-dashboard x-route="">
                    <x-card>
                        <h2>Recent Transactions</h2>
                        <x-transactions class="no-animation" only-recent no-menu></x-transactions>
                    </x-card>
                    <x-card style="max-width: 525px;">
                        <h2>Your Accounts</h2>
                        <x-accounts></x-accounts>
                    </x-card>
                    <x-card style="max-width: 360px;">
                        <h2>Nimiq Network</h2>
                        <x-network-indicator></x-network-indicator>
                    </x-card>
                </x-view-dashboard>
                <x-view-history x-route="history">
                    <x-card>
                        <h2>Transaction History</h2>
                        <x-transactions class="no-animation" passive></x-transactions>
                    </x-card>
                </x-view-history>
                <x-view-settings x-route="settings"></x-view-settings>

                <x-welcome-modal x-route-aside="welcome"></x-welcome-modal>
                <x-transaction-modal x-route-aside="transaction"></x-transaction-modal>
                <x-receive-request-link-modal x-route-aside="request"></x-receive-request-link-modal>
                <x-create-request-link-modal x-route-aside="receive" data-x-root="${config.root}"></x-create-request-link-modal>
            </section>
            <footer class="nimiq-dark">
                &copy; 2017-2018 Nimiq Foundation
                <br><small><a href="#" onclick="localStorage.removeItem('persistedState'); window.skipPersistingState = true; location.reload();">Delete persistence and reload</a></small>
            </footer>
            <x-router debug="true"></x-router>
            `
    }

    children() {
        return [
            XTotalAmount,
            XSendTransactionModal,
            XSendTransactionOfflineModal,
            XRouter,
            XAccounts,
            XTransactions,
            XNetworkIndicator,
            XTransactionModal,
            XWelcomeModal,
            XReceiveRequestLinkModal,
            XCreateRequestLinkModal
        ];
    }

    static get actions() {
        return { addAccount };
    }

    static mapStateToProps(state) {
        return {
            height: state.network.height,
            consensus: state.network.consensus,
            accountsInitialized: state.accounts.hasContent,
            accountsPresent: state.accounts.entries.size > 0
        }
    }

    _onPropertiesChanged(changes) {
        if (changes.accountsInitialized && !this.properties.accountsPresent) {
            this.$welcomeModal.show();
        }

        if (changes.accountsPresent) {
            this.$welcomeModal.hide();
        }
    }

    listeners() {
        return {
            'x-accounts-create': this._clickedCreateAccount.bind(this),
            'x-accounts-import-file': this._clickedImportAccountFile.bind(this),
            'x-accounts-import-words': this._clickedImportAccountWords.bind(this),
            'click button[new-tx]': this._clickedNewTransaction.bind(this),
            'click button[receive]': this._clickedReceive.bind(this),
            'x-send-transaction': this._signTransaction.bind(this),
            'x-send-prepared-transaction': this._clickedPreparedTransaction.bind(this),
            'x-send-transaction-confirm': this._sendTransactionNow.bind(this),
            'x-send-prepared-transaction-confirm': this._sendTransactionNow.bind(this),
            'x-account-modal-new-tx': this._newTransactionFrom.bind(this),
            'x-account-modal-backup-file': this._clickedAccountBackupFile.bind(this),
            'x-account-modal-backup-words': this._clickedAccountBackupWords.bind(this),
            'x-account-modal-rename': this._clickedAccountRename.bind(this)
        }
    }

    async _clickedCreateAccount() {
        try {
            await (await accountManager).create();
        } catch (e) {
            console.log(e);
            XToast.show('Account was not created.');
        }
    }

    async _clickedImportAccountFile() {
        try {
            await (await accountManager).importFile();
        } catch (e) {
            console.log(e);
            XToast.show('Account was not imported.');
        }
    }

    async _clickedImportAccountWords() {
        try {
            await (await accountManager).importWords();
        } catch (e) {
            console.log(e);
            XToast.show('Account was not imported.');
        }
    }

    async _clickedAccountBackupFile(address) {
        try {
            await (await accountManager).backupFile(address);
        } catch (e) {
            console.log(e);
            XToast.show('No backup created.');
        }
    }

    async _clickedAccountBackupWords(address) {
        try {
            await (await accountManager).backupWords(address);
        } catch (e) {
            console.log(e);
            XToast.show('No backup created.');
        }
    }

    async _clickedAccountRename(address) {
        try {
            await (await accountManager).rename(address);
        } catch (e) {
            console.log(e);
            XToast.show('Account was not renamed.');
        }
    }

    _clickedNewTransaction() {
        this._newTransactionFrom();
    }

    _newTransactionFrom(address) {
        if (address) {
            XSendTransactionModal.show(`sender=${ spaceToDash(address) }`);
        } else {
            XSendTransactionModal.show();
        }
    }

    _clickedPreparedTransaction() {
        XSendPreparedTransactionModal.show();
    }

    _clickedReceive() {
        XCreateRequestLinkModal.show();
    }

    async _signTransaction(tx) {
        // To allow for airgapped transaction creation, the validityStartHeight needs
        // to be allowed to be set by the user. Thus we need to parse what the user
        // put in and react accordingly.

        const setValidityStartHeight = parseInt(tx.validityStartHeight.trim());

        if (isNaN(setValidityStartHeight) && !this.properties.height) {
            XToast.show('Consensus not yet established, please try again in a few seconds.');
            return;
        }

        tx.value = Number(tx.value);
        tx.fee = Number(tx.fee) || 0;
        tx.validityStartHeight = isNaN(setValidityStartHeight) ? this.properties.height : setValidityStartHeight;
        tx.recipient = 'NQ' + tx.recipient;

        const signedTx = await (await accountManager).sign(tx);

        if (this.properties.consensus !== 'established') {
            XSendTransactionOfflineModal.instance.transaction = signedTx;
            XSendTransactionOfflineModal.show();
        } else {
            this._sendTransactionNow(signedTx);
        }
    }

    async _sendTransactionNow(signedTx) {
        if (!signedTx) return;

        const network = (await networkClient).rpcClient;
        try {
            await network.relayTransaction(signedTx);
        } catch(e) {
            XToast.show(e.message);

            XSendTransactionOfflineModal.instance.transaction = signedTx;
            XSendTransactionOfflineModal.show();
            return;
        }

        XSendTransactionModal.hide();
        XSendTransactionOfflineModal.hide();
        XSendPreparedTransactionModal.hide();

        XToast.show('Transaction sent!');
    }
}

// TODO catch errors in a top level error panel catching all previously uncaught exceptions > XApp?
