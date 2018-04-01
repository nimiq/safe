import XElement from '/libraries/x-element/x-element.js';
import XRouter from '/secure-elements/x-router/x-router.js';
import XSettings from '../settings/x-settings.js';
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
import XDisclaimerModal from './x-disclaimer-modal.js';
import Config from '/libraries/secure-utils/config/config.js';
import XEducationSlides from '/elements/x-education-slides/x-education-slides.js';
import totalAmount$ from '../selectors/totalAmount$.js';
import XSettingVisualLockModal from '../settings/x-setting-visual-lock-modal.js';
import XUpgradeModal from './x-upgrade-modal.js';

export default class XSafe extends MixinRedux(XElement) {

    html() {
        return `
            <div class="header-warning display-none">
                <i class="close-warning material-icons" onclick="this.parentNode.remove(this);">close</i>
                You are connecting to the Nimiq Testnet. Please <strong>do not</strong> use your Mainnet accounts in the Testnet!
            </div>
            <header>
                <div class="header-top">
                    <div class="nimiq-app-name">
                        <nimiq-logo>
                            NIMIQ SAFE<sup>BETA</sup>
                            <a logo-link href="#"></a>
                        </nimiq-logo>
                    </div>
                    <nav class="secondary-links">
                        <!-- <a href="https://nimiq.com">Homepage</a> -->
                        <!-- <a href="https://medium.com/nimiq-network">Blog</a> -->
                        <!-- <a href="https://nimiq.com/explorer">Explorer</a> -->
                    </nav>
                </div>
                <x-total-amount></x-total-amount>
                <div class="header-bottom">
                <nav class="actions">
                        <button class="small" new-tx disabled>Send</button>
                        <button class="small" receive disabled>Receive</button>
                    </nav>
                    <nav class="main">
                        <a x-href="">Dashboard</a>
                        <a x-href="history">History</a>
                        <a x-href="settings">Settings</a>
                    </nav>
                </div>
            </header>
            <style>
                .content-width {
                    max-width: var(--max-content-width);
                    margin: 0 auto;
                }
                nav.actions {
                    display: none;
                }
                nav.actions.floating-actions {
                    margin-bottom: -40px;
                    display: flex;
                    justify-content: flex-end;
                    padding-right: 10px;
                    float: none;
                }
                .floating-btn {
                    text-align: center;
                    width:110px;
                    margin-top: -45px;
                }
                .floating-btn button {
                    width: 60px !important;
                    height: 60px !important;
                    border-radius: 32px;
                    background-color: white;
                    background-position: center !important;
                    background-repeat: no-repeat !important;
                    margin-left: 0;
                    padding: 0;
                    min-height: 0;
                    box-shadow: 0 5px 15px 0px rgba(0, 0, 0, 0.2), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
                }
                .floating-btn .btn-text {
                    padding-top: 8px;
                    user-select: none;
                }
                h1 {
                    width: 100%;
                    text-align: left;
                    padding: 8px 38px;
                }
                .floating-btn [new-tx] {
                    background-image: url('data:image/svg+xml,<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path fill="#4463D7" d="M15,20H9V12H4.16L12,4.16L19.84,12H15V20Z" /></svg>') !important;
                }
                .floating-btn [receive] {
                    background-image: url('data:image/svg+xml,<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path fill="#9548EF" d="M9,4H15V12H19.84L12,19.84L4.16,12H9V4Z" /></svg>') !important;
                }
                @media (max-width: 730px) {
                    nav.actions {
                        display: block;
                    }
                    nav.actions.floating-actions {
                        display: none;
                    }
                    .content h1 {
                        display: none;
                    }
                }
            </style>
            <section class="content nimiq-dark content-width">
                <nav class="actions floating-actions">
                    <div class="floating-btn">
                        <button new-tx disabled></button>
                        <div class="btn-text">Send</div>
                    </div>
                    <div class="floating-btn">
                        <button receive disabled></button>
                        <div class="btn-text">Receive</div>
                    </div>
                    <x-send-transaction-modal x-route-aside="new-transaction"></x-send-transaction-modal>
                </nav>
                <x-view-dashboard x-route="">
                    <h1>Dashboard</h1>
                    <x-card style="max-width: 960px;">
                        <h2>Recent Transactions</h2>
                        <x-transactions class="no-animation" only-recent no-menu></x-transactions>
                    </x-card>
                    <x-card style="max-width: 536px;">
                        <h2>Your Accounts</h2>
                        <x-accounts></x-accounts>
                    </x-card>
                    <x-card style="max-width: 344px;">
                        <h2>Nimiq Network</h2>
                        <x-network-indicator></x-network-indicator>
                    </x-card>
                </x-view-dashboard>
                <x-view-history x-route="history">
                    <h1>History</h1>
                    <x-card>
                        <h2>Transaction history</h2>
                        <x-transactions class="no-animation" passive></x-transactions>
                    </x-card>
                </x-view-history>
                <x-view-settings x-route="settings">
                    <h1>Settings</h1>
                    <x-settings></x-settings>
                </x-view-settings>
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
            </footer>
            <x-router debug="true"></x-router>
            `
    }

    children() {
        return [
            XTotalAmount,
            XSendTransactionModal,
            XRouter,
            XAccounts,
            XTransactions,
            XSettings,
            XNetworkIndicator,
            XTransactionModal,
            XWelcomeModal,
            XReceiveRequestLinkModal,
            XCreateRequestLinkModal,
            XDisclaimerModal,
            XUpgradeModal
        ];
    }

    onCreate() {
        super.onCreate();
        this._introFinished = XEducationSlides.finished || Config.network === 'test'; // on testnet don't show the slides

        if (!this._introFinished) {
            XEducationSlides.lastSlide.instance.onHide = () => this._onIntroFinished();
            XEducationSlides.start();
        }

        if (Config.network !== 'main') {
            this.$('.header-warning').classList.remove('display-none');
        }

        this.$('[logo-link]').href = 'https://' + Config.tld;

        this.relayedTxResolvers = new Map();
    }

    static mapStateToProps(state) {
        return {
            height: state.network.height,
            consensus: state.network.consensus,
            accountsInitialized: state.accounts.hasContent,
            accountsPresent: state.accounts.entries.size > 0,
            totalAmount: totalAmount$(state)
        }
    }

    _onPropertiesChanged(changes) {
        if (changes.accountsInitialized && !this.properties.accountsPresent
            // TODO remove check for temporary enable-ledger flag
            && window.location.hash.indexOf('enable-ledger') === -1) {
            if (this._introFinished) this.$welcomeModal.show();
            else this._showWelcomeAfterIntro = true;
        }

        if (changes.accountsPresent) {
            this.$welcomeModal.hide();
            this.$('button[receive]').disabled = false;

            if (Config.offline) {
                this.$('button[new-tx]').disabled = false;
            }
        }

        if (changes.totalAmount !== undefined) {
            this.$('button[new-tx]').disabled = changes.totalAmount === 0;
        }
    }

    _onIntroFinished() {
        this._introFinished = true;

        if (this._showWelcomeAfterIntro) {
            this.$welcomeModal.show();
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
            'x-upgrade-account': this._clickedAccountUpgrade.bind(this),
            'x-account-modal-backup-words': this._clickedAccountBackupWords.bind(this),
            'x-account-modal-rename': this._clickedAccountRename.bind(this),
            'click a[disclaimer]': () => XDisclaimerModal.show(),
            'x-setting-visual-lock-pin': this._onSetVisualLock
        }
    }

    async _clickedCreateAccount() {
        try {
            await accountManager.createSafe();
            XToast.success('Account created successfully.');
        } catch (e) {
            console.error(e);
            XToast.warning('Account was not created.');
        }
    }

    async _clickedImportAccountLedger() {
        try {
            await accountManager.importLedger();
            XToast.success('Account imported successfully.');
        } catch(e) {
            XToast.warning('Account was not imported.');
        }
    }

    async _clickedImportAccountFile() {
        try {
            await accountManager.importFromFile();
            XToast.success('Account imported successfully.');
        } catch (e) {
            console.error(e);
            XToast.warning('Account was not imported.');
        }
    }

    async _clickedImportAccountWords() {
        try {
            await accountManager.importFromWords();
            XToast.success('Account imported successfully.');
        } catch (e) {
            console.error(e);
            XToast.warning('Account was not imported.');
        }
    }

    async _clickedAccountUpgrade(address) {
        try {
            await accountManager.upgrade(address);
            XToast.success('Account upgraded successfully.');
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

        if (this.properties.consensus !== 'established') {
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

    _onSetVisualLock(pin) {
        console.log(pin);
        localStorage.setItem('lock', pin);
        this.$('x-settings [visual-lock] input').checked = true;
        XToast.success('Visual lock set!');
        XSettingVisualLockModal.hide();
    }
}
