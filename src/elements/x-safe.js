import XElement from '/libraries/x-element/x-element.js';
import accountManager from '/libraries/account-manager/account-manager.js';
import Config from '/libraries/secure-utils/config/config.js';
import BrowserDetection from '/libraries/secure-utils/browser-detection/browser-detection.js';
import { spaceToDash } from '/libraries/nimiq-utils/parameter-encoding/parameter-encoding.js';
import XRouter from '/secure-elements/x-router/x-router.js';
import XToast from '/secure-elements/x-toast/x-toast.js';
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js';
import XNetworkIndicator from '/elements/x-network-indicator/x-network-indicator.js';
import XSendTransactionModal from '/elements/x-send-transaction/x-send-transaction-modal.js';
import XAccounts from '/elements/x-accounts/x-accounts.js';
import XTransactions from '/elements/x-transactions/x-transactions.js';
import XTransactionModal from '/elements/x-transactions/x-transaction-modal.js';
import XReceiveRequestLinkModal from '/elements/x-request-link/x-receive-request-link-modal.js';
import XCreateRequestLinkModal from '/elements/x-request-link/x-create-request-link-modal.js';
import XSendTransactionOfflineModal from '/elements/x-send-transaction/x-send-transaction-offline-modal.js';
import XSendPreparedTransactionModal from '/elements/x-send-transaction/x-send-prepared-transaction-modal.js';
import XSettings from '../settings/x-settings.js';
import XTotalAmount from './x-total-amount.js';
import networkClient from '../network-client.js';
import XWelcomeModal from './x-welcome-modal.js';
import XDisclaimerModal from './x-disclaimer-modal.js';
// import XSettingVisualLockModal from '../settings/x-setting-visual-lock-modal.js';
import XUpgradeModal from './x-upgrade-modal.js';
import totalAmount$ from '../selectors/totalAmount$.js';
import needsUpgrade$ from '../selectors/needsUpgrade$.js';
import { safeAccountsPresent$ } from '../selectors/safeAccounts$.js';
import XEducationSlides from '/elements/x-education-slides/x-education-slides.js';
import VContactListModal from '/elements/v-contact-list/v-contact-list-modal.js';

export default class XSafe extends MixinRedux(XElement) {

    html() {
        return `
            <div id="testnet-warning" class="header-warning display-none">
                <i class="close-warning material-icons" onclick="this.parentNode.remove(this);">close</i>
                You are connecting to the Nimiq Testnet. Please <strong>do not</strong> use your Mainnet accounts in the Testnet!
            </div>
            <div id="private-warning" class="header-warning display-none">
                <i class="close-warning material-icons" onclick="this.parentNode.remove(this);">close</i>
                You are using Private Browsing Mode. Your accounts will not be saved when this window is closed. Please make sure to <strong>create a backup / upgrade</strong>!
            </div>
            <header>
                <div class="header-top content-width">
                    <div class="nimiq-app-name">
                        <div class="safe-logo">
                            <a logo-link href="#"></a>
                        </div>
                    </div>
                    <nav class="secondary-links">
                        <a class="get-nim" href="https://changelly.com/exchange/BTC/NIM?ref_id=v06xmpbqj5lpftuj">Get NIM</a>
                        <a class="apps" href="https://nimiq.com/#apps">Apps</a>
                        <a class="settings" x-href="_settings_"></a>
                        <x-settings x-route-aside="settings"></x-settings>
                    </nav>
                </div>
                <x-total-amount></x-total-amount>
                <div class="header-bottom content-width">
                    <nav class="main">
                        <a x-href="">Dashboard</a>
                        <a x-href="history">History</a>
                    </nav>
                </div>
            </header>

            <section class="content nimiq-dark content-width">
                <nav class="actions floating-actions">
                    <div class="floating-btn">
                        <button new-tx disabled><span>Send</span></button>
                        <div class="btn-text">Send</div>
                    </div>
                    <div class="floating-btn">
                        <button receive disabled><span>Receive</span></button>
                        <div class="btn-text">Receive</div>
                    </div>
                    <div class="floating-btn">
                        <button contacts><span>Contacts</span></button>
                        <div class="btn-text">Contacts</div>
                    </div>
                    <x-send-transaction-modal x-route-aside="new-transaction"></x-send-transaction-modal>
                    <v-contact-list-modal x-route-aside="contact-list"></v-contact-list-modal>
                </nav>
                <x-view-dashboard x-route="" class="content-width">
                    <!-- <h1>Dashboard</h1> -->
                    <x-card style="max-width: 960px;">
                        <h2>Recent Transactions</h2>
                        <x-transactions class="no-animation" only-recent no-menu></x-transactions>
                    </x-card>
                    <x-card style="max-width: 552px;">
                        <h2>Your Accounts</h2>
                        <x-accounts></x-accounts>
                    </x-card>
                    <x-card style="max-width: 344px;">
                        <h2>Nimiq Network</h2>
                        <x-network-indicator></x-network-indicator>
                    </x-card>
                </x-view-dashboard>
                <x-view-history x-route="history" class="content-width">
                    <!-- <h1>History</h1> -->
                    <x-card>
                        <h2>Transaction history</h2>
                        <x-transactions class="no-animation" passive></x-transactions>
                    </x-card>
                </x-view-history>
                <x-welcome-modal x-route-aside="welcome"></x-welcome-modal>
                <x-upgrade-modal x-route-aside="please-upgrade"></x-upgrade-modal>
                <x-transaction-modal x-route-aside="transaction"></x-transaction-modal>
                <x-receive-request-link-modal x-route-aside="request"></x-receive-request-link-modal>
                <x-create-request-link-modal x-route-aside="receive" data-x-root="${Config.src('safe')}"></x-create-request-link-modal>
                <x-disclaimer-modal x-route-aside="disclaimer"></x-disclaimer-modal>
            </section>
            <footer class="nimiq-dark">
                &copy; 2017-2018 Nimiq Foundation<br>
                <a disclaimer>Disclaimer</a>
                <a warnings>Show information slides</a>
            </footer>
            `
    }

    children() {
        return [
            XTotalAmount,
            XSendTransactionModal,
            XAccounts,
            XTransactions,
            XSettings,
            XNetworkIndicator,
            XTransactionModal,
            XWelcomeModal,
            XReceiveRequestLinkModal,
            XCreateRequestLinkModal,
            XDisclaimerModal,
            XUpgradeModal,
            VContactListModal
        ];
    }

    async onCreate() {
        super.onCreate();

        XRouter.create();

        if (Config.network !== 'main') {
            this.$("#testnet-warning").classList.remove('display-none');
        }

        if (await BrowserDetection.isPrivateMode()) {
            this.$("#private-warning").classList.remove('display-none');
        }

        this.$('[logo-link]').href = 'https://' + Config.tld;

        this.relayedTxResolvers = new Map();
    }

    static mapStateToProps(state) {
        return {
            height: state.network.height,
            hasConsensus: state.network.consensus === 'established',
            accountsInitialized: state.accounts.hasContent,
            safeAccountsPresent: safeAccountsPresent$(state),
            totalAmount: totalAmount$(state),
            upgradeAccount: needsUpgrade$(state)
        }
    }

    _onPropertiesChanged(changes) {
        if (changes.accountsInitialized && !this.properties.safeAccountsPresent) {
            this.$welcomeModal.show(); console.log('WelcomeModal show');
        }

        if (changes.safeAccountsPresent) {
            this.$welcomeModal.hide();  console.log('WelcomeModal hide');
            this.$('button[receive]').disabled = false;

            if (Config.offline) {
                this.$('button[new-tx]').disabled = false;
            }
        }

        if (changes.totalAmount !== undefined) {
            this.$('button[new-tx]').disabled = changes.totalAmount === 0;
        }
    }

    listeners() {
        return {
            'x-accounts-create': this._clickedCreateAccount.bind(this),
            'x-accounts-import-file': this._clickedImportAccountFile.bind(this),
            'x-accounts-import-words': this._clickedImportAccountWords.bind(this),
            'x-accounts-import-ledger': this._clickedImportAccountLedger.bind(this),
            'click button[new-tx]': this._clickedNewTransaction.bind(this),
            'click button[receive]': this._clickedReceive.bind(this),
            'x-send-transaction': this._signTransaction.bind(this),
            'x-send-prepared-transaction': this._clickedPreparedTransaction.bind(this),
            'x-send-prepared-transaction-confirm': this._sendTransactionNow.bind(this),
            'x-account-modal-new-tx': this._newTransactionFrom.bind(this),
            'x-account-modal-payout': this._newPayoutTransaction.bind(this),
            'x-upgrade-account': this._clickedAccountUpgrade.bind(this),
            'x-account-modal-backup-words': this._clickedAccountBackupWords.bind(this),
            'x-account-modal-rename': this._clickedAccountRename.bind(this),
            'x-confirm-ledger-address': this._clickedConfirmLedgerAddress.bind(this),
            'click a[disclaimer]': () => XDisclaimerModal.show(),
            // 'x-setting-visual-lock-pin': this._onSetVisualLock,
            'click a[warnings]': this._showWarnings,
            'click button[contacts]': () => VContactListModal.show(true)
        }
    }

    async _clickedCreateAccount() {
        try {
            await accountManager.createSafe();
            XToast.success('Account created successfully.');
            // XEducationSlides.hide();
            XWelcomeModal.hide();
        } catch (e) {
            console.error(e);
            if (e.code === 'K3' || e.code === 'K4') {
                // Show Safari/iOS > 10 accounts error
                XToast.warning(e.message);
            } else {
                XToast.warning('Account was not created.');
            }
        }
    }

    async _clickedImportAccountFile() {
        try {
            await accountManager.importFromFile();
            XToast.success('Account imported successfully.');
            // XEducationSlides.hide();
            XWelcomeModal.hide();
        } catch (e) {
            console.error(e);
            if (e.code === 'K3' || e.code === 'K4') {
                // Show Safari/iOS > 10 accounts error
                XToast.warning(e.message);
            } else {
                XToast.warning('Account was not imported.');
            }
        }
    }

    async _clickedImportAccountWords() {
        try {
            await accountManager.importFromWords();
            XToast.success('Account imported successfully.');
            // XEducationSlides.hide();
            XWelcomeModal.hide();
        } catch (e) {
            console.error(e);
            if (e.code === 'K3' || e.code === 'K4') {
                // Show Safari/iOS > 10 accounts error
                XToast.warning(e.message);
            } else {
                XToast.warning('Account was not imported.');
            }
        }
    }

    async _clickedAccountUpgrade(address) {
        try {
            await accountManager.upgrade(address);
            XToast.success('Account upgraded successfully.');
            XUpgradeModal.hide();
            // XEducationSlides.hide();
            XWelcomeModal.hide();
        } catch (e) {
            console.error(e);
            XToast.warning('Upgrade not completed.');
        }
    }

    async _clickedAccountBackupWords(address) {
        try {
            await accountManager.backupWords(address);
            XToast.success('Account backed up successfully.');
        } catch (e) {
            console.error(e);
            XToast.warning('No backup created.');
        }
    }

    async _clickedAccountRename(address) {
        try {
            await accountManager.rename(address);
            XToast.success('Account renamed successfully.');
        } catch (e) {
            console.error(e);
            XToast.warning('Account was not renamed.');
        }
    }

    async _clickedImportAccountLedger() {
        try {
            // XEducationSlides.hide(); // hide x education slides before showing the ledger modal
            XWelcomeModal.hide();
            await accountManager.importLedger();
            XToast.success('Account imported successfully.');
        } catch(e) {
            if ((e.message || e).toLowerCase().indexOf('not supported') !== -1) {
                XToast.warning('Your browser does not have Ledger support or it is not enabled.');
            } else {
                XToast.warning('Account was not imported.');
            }
        }
    }

    async _clickedConfirmLedgerAddress(address) {
        try {
            await accountManager.confirmLedgerAddress(address);
            XToast.success('Ledger account confirmed.');
        } catch(e) {
            if ((e.message || e).toLowerCase().indexOf('not supported') !== -1) {
                XToast.warning('Your browser does not have Ledger support or it is not enabled.');
            } else {
                XToast.warning('Ledger Account not confirmed.');
            }
        }
    }

    _clickedNewTransaction() {
        this._newTransactionFrom();
    }

    _newTransactionFrom(address) {
        if (address) {
            XSendTransactionModal.show(`${ spaceToDash(address) }`, 'sender');
        } else {
            XSendTransactionModal.show();
        }
    }

    _newPayoutTransaction(data) {
        XSendTransactionModal.instance.listenOnce('x-send-transaction-cleared', function() {
            XSendTransactionModal.instance.sender = data.vestingAccount;
            XSendTransactionModal.instance.$accountsDropdown.disable();
        });
        XSendTransactionModal.show(`${ spaceToDash(data.owner) }`, 'vesting');
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
            if (Config.offline) {
                XToast.warning('In offline mode, the validity-start-height needs to be set (advanced settings).');
            } else {
                XToast.warning('Consensus not yet established, please try again in a few seconds.');
            }
            return;
        }

        tx.value = Number(tx.value);
        tx.fee = Number(tx.fee) || 0;
        tx.validityStartHeight = isNaN(setValidityStartHeight) ? this.properties.height : setValidityStartHeight;
        tx.recipient = 'NQ' + tx.recipient;

        const signedTx = await accountManager.sign(tx);

        if (!this.properties.hasConsensus) {
            XSendTransactionOfflineModal.instance.transaction = signedTx;
            XSendTransactionOfflineModal.show();
        } else {
            this._sendTransactionNow(signedTx);
        }
    }

    async _sendTransactionNow(signedTx) {
        if (!signedTx) return;

        if (Config.offline) {
            XSendTransactionOfflineModal.instance.transaction = signedTx;
            XSendTransactionOfflineModal.show();
            return;
        }

        // Give user feedback that something is happening
        XSendTransactionModal.instance.loading = true;
        XSendPreparedTransactionModal.instance.loading = true;

        const network = await networkClient.rpcClient;
        try {
            const relayedTx = new Promise((resolve, reject) => {
                this.relayedTxResolvers.set(signedTx.hash, resolve);
                setTimeout(reject, 8000, new Error('Transaction could not be sent'));
            });

            await network.relayTransaction(signedTx);

            try {
                await relayedTx;
            } catch(e) {
                this.relayedTxResolvers.delete(signedTx.hash);
                network.removeTxFromMempool(signedTx);
                throw e;
            }

            XSendTransactionModal.hide();
            XSendPreparedTransactionModal.hide();

            XToast.success('Transaction sent!');
        } catch(e) {
            XToast.error(e.message || e);
            XSendTransactionModal.instance.loading = false;
            XSendPreparedTransactionModal.instance.loading = false;
        }
    }

    // _onSetVisualLock(pin) {
    //     console.log(pin);
    //     localStorage.setItem('lock', pin);
    //     this.$('x-settings [visual-lock] input').checked = true;
    //     XToast.success('Visual lock set!');
    //     XSettingVisualLockModal.hide();
    // }

    _showWarnings() {
        XEducationSlides.onFinished = XEducationSlides.hide;
        XEducationSlides._slides = XEducationSlides.allSlides.slice(1, -1);
        XEducationSlides.start(true);
    }
}
