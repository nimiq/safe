import XElement from '/libraries/x-element/x-element.js';
import XRouter from '/elements/x-router/x-router.js';
import XAccounts from '/elements/x-accounts/x-accounts.js';
import XTransactions from '/elements/x-transactions/x-transactions.js';
import accountManager from '/libraries/account-manager/account-manager.js';
import networkClient from '../network-client.js';
import { addAccount } from '/elements/x-accounts/accounts-redux.js';
import MixinRedux from '/elements/mixin-redux/mixin-redux.js';
import XTotalAmount from './x-total-amount.js';
import XWalletBackupImportModal from '/elements/x-wallet-backup-import/x-wallet-backup-import-modal.js';
import XNetworkIndicator from '/elements/x-network-indicator/x-network-indicator.js';
import XSendTransactionModal from '/elements/x-send-transaction/x-send-transaction-modal.js';
import XSendTransactionPlainConfirmModal from '/elements/x-send-transaction/x-send-transaction-plain-confirm-modal.js';
import XToast from '/elements/x-toast/x-toast.js';
import XTransactionModal from '/elements/x-transactions/x-transaction-modal.js';

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
                        <a href="https://medium.com/nimiq-network">Blog</a>
                        <a href="https://nimiq.com/explorer">Explorer</a>
                    </nav>
                </div>
                <x-total-amount></x-total-amount>
                <div class="header-bottom">
                    <nav class="main">
                        <a x-href="">Dashboard</a>
                        <a x-href="transactions">Transactions</a>
                        <!-- <a x-href="settings">Settings</a> -->
                    </nav>
                    <nav class="actions">
                        <button class="small" new-tx>New Tx</button>
                        <x-send-transaction-modal x-route-aside="new-transaction"></x-send-transaction-modal>
                    </nav>
                </div>
            </header>
            <section class="content nimiq-dark">
                <x-view-dashboard x-route="">
                    <x-card>
                        <h2>Recent Transactions</h2>
                        <x-transactions only-recent></x-transactions>
                    </x-card>
                    <x-card style="max-width: 512px;">
                        <h2>Your Accounts</h2>
                        <x-accounts></x-accounts>
                    </x-card>
                    <x-card style="max-width: 400px;">
                        <h2>Network Status</h2>
                        <x-network-indicator></x-network-indicator>
                    </x-card>
                </x-view-dashboard>
                <x-view-transactions x-route="transactions">
                    <x-card>
                        <h2>Transactions</h2>
                        <x-transactions></x-transactions>
                    </x-card>
                </x-view-transactions>
                <x-view-settings x-route="settings"></x-view-settings>

                <x-transaction-modal x-route-aside="transaction"></x-transaction-modal>
            </section>
            <footer class="nimiq-dark">
                &copy; 2017-2018 Nimiq Foundation
                <br><small><a href="#" onclick="localStorage.removeItem('persistedState'); window.skipPersistingState = true; location.reload();">Delete persistance and reload</a></small>
            </footer>
            <x-router debug="true"></x-router>
            `
    }

    children() {
        return [
            XTotalAmount,
            XSendTransactionModal,
            XSendTransactionPlainConfirmModal,
            XRouter,
            XAccounts,
            XTransactions,
            XNetworkIndicator,
            XTransactionModal
        ];
    }

    static get actions() {
        return { addAccount };
    }

    listeners() {
        return {
            'x-accounts-create': async () => (await accountManager).create(),
            'x-accounts-import': async () => (await accountManager).import(),
            'click button[new-tx]': () => this._clickedNewTransaction(),
            'x-send-transaction': this._signTransaction.bind(this),
            'x-send-transaction-confirm': this._sendTransactionNow.bind(this),
            'x-account-modal-new-tx': this._clickedNewTransaction.bind(this),
            'x-account-modal-export': async (a) => (await accountManager).backup(a),
            'x-account-modal-rename': async (a) => (await accountManager).rename(a)
        }
    }

    onCreate() {
        // Trigger history update when state loaded from persistedState
        // (request is aborted in function when no accounts exist)
        this.$transactions[0].requestTransactionHistory();
    }

    static mapStateToProps(state) {
        return {
            height: state.network.height
        }
    }

    _clickedNewTransaction(address) {
        XSendTransactionModal.instance.clear(this.properties.height);
        XSendTransactionModal.show(address && this._spaceToDash(address) || undefined);
    }

    _spaceToDash(string) {
        return string.replace(/ /gi, '-');
    }

    async _signTransaction(tx) {
        tx.value = Number(tx.value);
        tx.fee = Number(tx.fee) || 0;
        tx.validityStartHeight = parseInt(tx.validityStartHeight) || this.properties.height;
        tx.recipient = 'NQ' + tx.recipient;

        const signedTx = await (await accountManager).sign(tx);

        // Show textform TX to the user and require explicit click on the "SEND NOW" button
        XSendTransactionPlainConfirmModal.instance.transaction = signedTx;
        XSendTransactionPlainConfirmModal.show();
    }

    async _sendTransactionNow(signedTx) {
        if (!signedTx) return;

        const network = (await networkClient).rpcClient;
        try {
            await network.relayTransaction(signedTx);
        } catch(e) {
            XToast.show(e.message);
            return;
        }

        XSendTransactionPlainConfirmModal.instance.sent();
        XSendTransactionPlainConfirmModal.hide();

        XToast.show('Sent transaction');
    }
}

// TODO catch errors in a top level error panel catching all previously uncaught exceptions > XApp?
