/*import { BrowserDetection } from '@nimiq/utils';
import XElement from '../lib/x-element/x-element.js';
import hubClient from '../hub-client.js';
import Config from '../config/config.js';
import { spaceToDash } from '../lib/parameter-encoding.js';
import XRouter from '../elements/x-router/x-router.js';
import XToast from '../elements/x-toast/x-toast.js';
import MixinRedux from '../elements/mixin-redux';
import XNetworkIndicator from '../elements/x-network-indicator/x-network-indicator.js';
import XSendTransactionOfflineModal from '../elements/x-send-transaction/x-send-transaction-offline-modal.js';
import XSendPreparedTransactionModal from '../elements/x-send-transaction/x-send-prepared-transaction-modal.js';
import networkClient from '../network-client.js';
import XDisclaimerModal from './x-disclaimer-modal.js';
import XFaucetModal from './x-faucet-modal.js';
import XEducationSlides from '../elements/x-education-slides/x-education-slides.js';
import VContactList from '../elements/v-contact-list/v-contact-list.js';
import VContactListModal from '../elements/v-contact-list/v-contact-list-modal.js';
import { activeWallet$ } from '../selectors/wallet$.js';
import { WalletType } from '../redux/wallet-redux.js';

export default class XSafe extends MixinRedux(XElement) {

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
    }

    static mapStateToProps(state) {
        return {
            height: state.network.height,
            hasConsensus: state.network.consensus === 'established',
            activeWallet: activeWallet$(state),
            walletsLoaded: state.wallets.hasContent,
        }
    }

    _onPropertiesChanged(changes) {
        if (this.properties.walletsLoaded && !this.properties.activeWallet) {
            hubClient.onboard();
            return;
        }

        if (changes.activeWallet) {
            const shouldDisplayFile = this.properties.activeWallet.type !== WalletType.LEGACY && !this.properties.activeWallet.fileExported;
            const shouldDisplayWords = !shouldDisplayFile && this.properties.activeWallet.type !== WalletType.LEGACY && !this.properties.activeWallet.wordsExported;
            this.$('.backup-reminder.file').classList.toggle('display-none', !shouldDisplayFile);
            this.$('.backup-reminder.words').classList.toggle('display-none', !shouldDisplayWords);
        }
    }

    listeners() {
        return {
            'x-send-transaction': this._signTransaction.bind(this),
            'x-send-prepared-transaction': this._clickedPreparedTransaction.bind(this),
            'x-send-prepared-transaction-confirm': this._sendTransactionNow.bind(this),
            'x-account-modal-new-tx': this._newTransactionFrom.bind(this),
            'x-account-modal-payout': this._newPayoutTransaction.bind(this),
            'x-account-modal-backup': this._clickedExportWords.bind(this),
            'x-account-modal-rename': this._clickedAccountRename.bind(this),
            'x-account-modal-change-passphrase': this._clickedAccountChangePassword.bind(this),
            'click a[warnings]': this._showWarnings,
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

    _newPayoutTransaction(data) {
        XSendTransactionModal.show(`${ spaceToDash(data.owner) }`, 'vesting');
        XSendTransactionModal.getInstance().sender = data.vestingAccount;
    }

    _clickedPreparedTransaction() {
        XSendPreparedTransactionModal.show();
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

        tx.value = Number(tx.value) * 1e5;
        tx.fee = (Number(tx.fee) || 0) * 1e5;
        tx.validityStartHeight = isNaN(setValidityStartHeight) ? this.properties.height : setValidityStartHeight;
        tx.recipient = 'NQ' + tx.recipient;

        const signedTx = await hubClient.sign(tx);

        signedTx.value = signedTx.value / 1e5;
        signedTx.fee = signedTx.fee / 1e5;

        if (!this.properties.hasConsensus) {
            XSendTransactionOfflineModal.getInstance().transaction = signedTx;
            XSendTransactionOfflineModal.show();
        } else {
            this._sendTransactionNow(signedTx);
        }
    }

    async _sendTransactionNow(signedTx) {
        if (!signedTx) return;

        if (Config.offline) {
            XSendTransactionOfflineModal.getInstance().transaction = signedTx;
            XSendTransactionOfflineModal.show();
            return;
        }

        // Give user feedback that something is happening
        XSendTransactionModal.getInstance().loading = true;
        XSendPreparedTransactionModal.getInstance().loading = true;

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
            window.setTimeout(XSendTransactionModal.getInstance().clear.bind(XSendTransactionModal.getInstance()), 500);
            XSendPreparedTransactionModal.hide();
        } catch(e) {
            XToast.error(e.message || e);
            XSendTransactionModal.getInstance().loading = false;
            XSendPreparedTransactionModal.getInstance().loading = false;
        }
    }

    _showWarnings() {
        XEducationSlides.onFinished = XEducationSlides.hide;
        XEducationSlides.start();
    }
}*/
