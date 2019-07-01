/*import { BrowserDetection } from '@nimiq/utils';
import hubClient from '../hub-client.js';
import Config from '../config/config.js';
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
}*/
