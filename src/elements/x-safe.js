/*import { BrowserDetection } from '@nimiq/utils';
import hubClient from '../hub-client.js';
import Config from '../config/config.js';
import { spaceToDash } from '../lib/parameter-encoding.js';
import XRouter from '../elements/x-router/x-router.js';
import MixinRedux from '../elements/mixin-redux';
import XNetworkIndicator from '../elements/x-network-indicator/x-network-indicator.js';
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

    _showWarnings() {
        XEducationSlides.onFinished = XEducationSlides.hide;
        XEducationSlides.start();
    }
}*/
