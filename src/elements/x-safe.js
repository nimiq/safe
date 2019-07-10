import XElement from '../lib/x-element/x-element.js';
import hubClient from '../hub-client.js';
import Config from '../lib/config.js';
import BrowserDetection from '../../node_modules/@nimiq/utils/dist/module/BrowserDetection.js';
import { spaceToDash } from '../lib/parameter-encoding.js';
import XRouter from '../elements/x-router/x-router.js';
import XToast from '../elements/x-toast/x-toast.js';
import MixinRedux from '../elements/mixin-redux.js';
import XNetworkIndicator from '../elements/x-network-indicator/x-network-indicator.js';
import XSendTransactionModal from '../elements/x-send-transaction/x-send-transaction-modal.js';
import XAccounts from '../elements/x-accounts/x-accounts.js';
import XTransactions from '../elements/x-transactions/x-transactions.js';
import XTransactionModal from '../elements/x-transactions/x-transaction-modal.js';
import XReceiveRequestLinkModal from '../elements/x-request-link/x-receive-request-link-modal.js';
import XCreateRequestLinkModal from '../elements/x-request-link/x-create-request-link-modal.js';
import XSendTransactionOfflineModal from '../elements/x-send-transaction/x-send-transaction-offline-modal.js';
import XSendPreparedTransactionModal from '../elements/x-send-transaction/x-send-prepared-transaction-modal.js';
import XSettings from '../settings/x-settings.js';
import XTotalAmount from './x-total-amount.js';
import networkClient from '../network-client.js';
import XDisclaimerModal from './x-disclaimer-modal.js';
import XFaucetModal from './x-faucet-modal.js';
import XEducationSlides from '../elements/x-education-slides/x-education-slides.js';
import VContactList from '../elements/v-contact-list/v-contact-list.js';
import VContactListModal from '../elements/v-contact-list/v-contact-list-modal.js';
import VMigrationWelcome from '../elements/v-migration-welcome/v-migration-welcome.js';
import VWalletSelector from '../elements/v-wallet-selector/v-wallet-selector.js';
import { activeWallet$ } from '../selectors/wallet$.js';
import { WalletType } from '../wallet-redux.js';
import TrackingConsensus from '../lib/tracking-consensus.js';

export default class XSafe extends MixinRedux(XElement) {

    html() {
        return `
            <div id="testnet-warning" class="nq-gold-bg header-warning display-none">
                <i class="close-warning material-icons" onclick="this.parentNode.remove(this);">close</i>
                You are connecting to the Nimiq Testnet. Please <strong>do not</strong> use your Mainnet accounts in the Testnet!
            </div>
            <div id="private-warning" class="nq-gold-bg header-warning display-none">
                <i class="close-warning material-icons" onclick="this.parentNode.remove(this);">close</i>
                You are using Private Browsing Mode. Your accounts will not be saved when this window is closed. Please make sure to <strong>create a backup</strong>!
            </div>
            <header>
                <div class="header-top content-width">
                    <a class="logo" href="#">
                        <div class="nq-icon nimiq-logo"></div>
                        <span class="logo-wordmark">Nimiq</span>
                    </a>
                    <nav class="secondary-links">
                        <a target="_blank" class="get-nim" href="https://nimiq.com/#exchanges">Get NIM</a>
                        <a target="_blank" class="apps" href="https://nimiq.com/#apps">Apps</a>
                        <v-wallet-selector class="desktop mobile-hidden"></v-wallet-selector>
                        <x-settings x-route-aside="settings"></x-settings>
                    </nav>
                </div>
                <v-wallet-selector class="mobile mobile-inline-block"></v-wallet-selector>
                <x-total-amount></x-total-amount>
                <div class="header-bottom content-width">
                    <div class="backup-reminder words">
                        <a class="action" backup-words>
                            <div class="icon words">
                                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M20.13 33.15l-2.2 2.2c-.2.2-.52.2-.72 0l-2.2-2.2a.52.52 0 0 1-.15-.37V30.9l-1.7-.95a1.04 1.04 0 0 1 .15-1.88l1.55-.58v-1.06l-2.04-1.5a1.04 1.04 0 0 1 .15-1.76l1.89-.95v-3.38a7.77 7.77 0 1 1 5.42 0v13.95c0 .14-.05.27-.15.37zM16.47 7.52a1.55 1.55 0 1 0 2.2 2.2 1.55 1.55 0 0 0-2.2-2.2z" fill="#fff"/></svg>
                            </div>
                            <strong class="text">Backup your Account with Recovery Words.</strong>
                        </a>
                        <a class="dismiss display-none" dismiss-backup-words>&times;<span> dismiss</span></a>
                    </div>
                    <div class="backup-reminder file">
                        <a class="action" backup-file>
                            <div class="icon file">
                                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M20.13 33.15l-2.2 2.2c-.2.2-.52.2-.72 0l-2.2-2.2a.52.52 0 0 1-.15-.37V30.9l-1.7-.95a1.04 1.04 0 0 1 .15-1.88l1.55-.58v-1.06l-2.04-1.5a1.04 1.04 0 0 1 .15-1.76l1.89-.95v-3.38a7.77 7.77 0 1 1 5.42 0v13.95c0 .14-.05.27-.15.37zM16.47 7.52a1.55 1.55 0 1 0 2.2 2.2 1.55 1.55 0 0 0-2.2-2.2z" fill="#fff"/></svg>
                            </div>
                            <strong class="text">Download your Login File to save your Account.</strong>
                        </a>
                        <a class="dismiss display-none" dismiss-backup-file>&times;<span> dismiss</span></a>
                    </div>
                </div>
            </header>

            <section class="content nimiq-dark content-width">
                <nav class="actions floating-actions">
                    <div class="floating-btn">
                        <button new-tx>
                            <span>Send</span>
                        </button>
                        <div class="btn-text">Send</div>
                    </div>
                    <div class="floating-btn">
                        <button receive>
                            <span>Receive</span>
                        </button>
                        <div class="btn-text">Receive</div>
                    </div>
                    <div class="floating-btn">
                        <button icon-qr-scan><span>Scan</span></button>
                        <div class="btn-text">Scan</div>
                    </div>
                    <x-send-transaction-modal x-route-aside="new-transaction"></x-send-transaction-modal>
                    <v-contact-list-modal x-route-aside="contact-list"></v-contact-list-modal>
                </nav>
                <x-view-dashboard x-route="" class="content-width">
                    <!-- <h1>Dashboard</h1> -->
                    <x-card style="max-width: 960px;">
                        <x-transactions class="no-animation" only-recent></x-transactions>
                    </x-card>
                    <x-card style="max-width: 552px;">
                        <h2>Addresses</h2>
                        <x-accounts></x-accounts>
                    </x-card>
                    <x-card style="max-width: 344px;">
                        <v-contact-list></v-contact-list>
                    </x-card>
                </x-view-dashboard>
                <x-transaction-modal x-route-aside="transaction"></x-transaction-modal>
                <x-receive-request-link-modal x-route-aside="request"></x-receive-request-link-modal>
                <x-create-request-link-modal x-route-aside="receive" data-x-root="${Config.src('safe')}"></x-create-request-link-modal>
                <x-disclaimer-modal x-route-aside="disclaimer"></x-disclaimer-modal>
                <div id="tracking-consensus" class="nq-shadow display-none">
                    Help Nimiq improve by sharing anonymized usage data. Thank you! ❤️
                    <div class="button-group">
                        <button class="nq-button-pill light-blue inverse" tracking-yes>Yes</button>
                        <button class="nq-button-s inverse" tracking-no>No</button>
                        <button class="nq-button-s inverse" tracking-browser-only>Browser-info only</button>
                    </div>
                </div>
            </section>
            <footer class="nimiq-dark">
                <x-network-indicator></x-network-indicator>
                <div>&copy; 2017-2019 Nimiq Foundation</div>
                <a disclaimer>Disclaimer</a>
                <a warnings>Safety Primer</a>
                <a migration-welcome>Update Notes</a>
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
            XReceiveRequestLinkModal,
            XCreateRequestLinkModal,
            XDisclaimerModal,
            VContactListModal,
            VContactList,
            VWalletSelector,
        ];
    }

    async onCreate() {
        super.onCreate();

        if (location.origin === 'https://safe.nimiq.com') TrackingConsensus.init();

        XRouter.create();

        if (Config.network !== 'main') {
            this.$("#testnet-warning").classList.remove('display-none');
            this.$("a.apps").href = 'https://nimiq-testnet.com/#apps';
            const getNimButton = this.$("a.get-nim");
            getNimButton.href = 'javascript:';
            getNimButton.addEventListener('click', () => XFaucetModal.show());
        }

        if (await BrowserDetection.isPrivateMode()) {
            this.$("#private-warning").classList.remove('display-none');
        }

        this.$('.logo').href = 'https://' + Config.tld;

        this.relayedTxResolvers = new Map();

        // App finished loading
        setTimeout(() => document.body.classList.remove('preparing'));
    }

    static mapStateToProps(state) {
        return {
            height: state.network.height,
            hasConsensus: state.network.consensus === 'established',
            activeWallet: activeWallet$(state),
        }
    }

    _onPropertiesChanged(changes) {
        if (changes.activeWallet) {
            const shouldDisplayFile = this.properties.activeWallet.type !== WalletType.LEGACY && !this.properties.activeWallet.fileExported;
            const shouldDisplayWords = !shouldDisplayFile && this.properties.activeWallet.type !== WalletType.LEGACY && !this.properties.activeWallet.wordsExported;
            this.$('.backup-reminder.file').classList.toggle('display-none', !shouldDisplayFile);
            this.$('.backup-reminder.words').classList.toggle('display-none', !shouldDisplayWords);
        }
    }

    listeners() {
        return {
            'x-accounts-add': this._clickedAddAccount.bind(this),
            'click button[new-tx]': this._clickedNewTransaction.bind(this),
            'click button[receive]': this._clickedReceive.bind(this),
            'click button[icon-qr-scan]': this._clickedScan.bind(this),
            'x-send-transaction': this._signTransaction.bind(this),
            'x-send-prepared-transaction': this._clickedPreparedTransaction.bind(this),
            'x-send-prepared-transaction-confirm': this._sendTransactionNow.bind(this),
            'x-account-modal-new-tx': this._newTransactionFrom.bind(this),
            'x-account-modal-payout': this._newPayoutTransaction.bind(this),
            'x-account-modal-backup': this._clickedExportWords.bind(this),
            'x-account-modal-rename': this._clickedAccountRename.bind(this),
            'x-account-modal-change-passphrase': this._clickedAccountChangePassword.bind(this),
            'click a[disclaimer]': () => XDisclaimerModal.show(),
            'click a[warnings]': this._showWarnings,
            'click a[migration-welcome]': this._showMigrationWelcome,
            'click [backup-words]': () => this._clickedExportWords(),
            'click [backup-file]': () => this._clickedExportFile(),
            'click [tracking-yes]': () => TrackingConsensus.update({ allowsBrowserData: true, allowsUsageData: true }),
            'click [tracking-no]': () => TrackingConsensus.update({ allowsBrowserData: false, allowsUsageData: false }),
            'click [tracking-browser-only]': () => TrackingConsensus.update({ allowsBrowserData: true, allowsUsageData: false }),
        }
    }

    async _clickedAddAccount(walletId) {
        try {
            await hubClient.addAccount(walletId);
        } catch (e) {
            console.error(e);
            if (e.code === 'K3' || e.code === 'K4') {
                // Show Safari/iOS > 10 accounts error
                XToast.warning(e.message);
            } else {
                XToast.warning('Account was not added.');
            }
        }
    }

    async _clickedExportFile() {
        const walletId = this.properties.activeWallet.id;
        try {
            await hubClient.export(walletId);
        } catch (e) {
            console.error(e);
        }
    }

    async _clickedExportWords(givenWalletId = null) {
        const walletId = givenWalletId || this.properties.activeWallet.id;
        try {
            await hubClient.exportWords(walletId);
        } catch (e) {
            console.error(e);
        }
    }

    async _clickedAccountChangePassword(walletId) {
        try {
            await hubClient.changePassword(walletId);
        } catch (e) {
            console.error(e);
            XToast.warning('Password not changed.');
        }
    }

    async _clickedAccountRename(params) {
        try {
            await hubClient.rename(params.walletId, params.address);
        } catch (e) {
            console.error(e);
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
        XSendTransactionModal.show(`${ spaceToDash(data.owner) }`, 'vesting');
        XSendTransactionModal.instance.sender = data.vestingAccount;
    }

    _clickedPreparedTransaction() {
        XSendPreparedTransactionModal.show();
    }

    _clickedReceive() {
        XCreateRequestLinkModal.show();
    }

    _clickedScan() {
        XSendTransactionModal.show(/* address */ null, 'scan');
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

        tx.value = Math.round(Number(tx.value) * 1e5);
        tx.fee = Math.round((Number(tx.fee) || 0) * 1e5);
        tx.validityStartHeight = isNaN(setValidityStartHeight) ? this.properties.height : setValidityStartHeight;
        tx.recipient = 'NQ' + tx.recipient;

        const signedTx = await hubClient.sign(tx);

        signedTx.value = signedTx.value / 1e5;
        signedTx.fee = signedTx.fee / 1e5;

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

        const network = await networkClient.client;
        try {
            const relayedTx = new Promise((resolve, reject) => {
                this.relayedTxResolvers.set(signedTx.hash, resolve);
                setTimeout(reject, 8000, new Error('Transaction could not be sent'));
            });

            network.relayTransaction(signedTx);

            try {
                await relayedTx;
                this.relayedTxResolvers.delete(signedTx.hash);
            } catch(e) {
                this.relayedTxResolvers.delete(signedTx.hash);
                try { network.removeTxFromMempool(signedTx); } catch(e) {}
                throw e;
            }

            XSendTransactionModal.hide();
            // give modal time to disappear
            window.setTimeout(XSendTransactionModal.instance.clear.bind(XSendTransactionModal.instance), 500);
            XSendPreparedTransactionModal.hide();
        } catch(e) {
            XToast.error(e.message || e);
            XSendTransactionModal.instance.loading = false;
            XSendPreparedTransactionModal.instance.loading = false;
        }
    }

    _showMigrationWelcome() {
        VMigrationWelcome.show();
    }

    _showWarnings() {
        XEducationSlides.onFinished = XEducationSlides.hide;
        XEducationSlides.start();
    }
}
