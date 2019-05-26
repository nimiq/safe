<template>
    <div id="app">
        <div v-if="isTestnet" id="testnet-warning" class="header-warning display-none">
            <i class="close-warning material-icons" onclick="this.parentNode.remove(this);">close</i>
            You are connecting to the Nimiq Testnet. Please <strong>do not</strong> use your Mainnet accounts in the Testnet!
        </div>
        <div v-if="showPrivateBrowsingWarning" id="private-warning" class="header-warning display-none">
            <i class="close-warning material-icons" onclick="this.parentNode.remove(this);">close</i>
            You are using Private Browsing Mode. Your accounts will not be saved when this window is closed. Please make sure to <strong>create a backup</strong>!
        </div>
        <header>
            <div class="header-top content-width">
                <a class="logo" :href="logoUrl">
                    <div class="nq-icon nimiq-logo"></div>
                    <span class="logo-wordmark">Nimiq</span>
                </a>
                <nav class="secondary-links">
                    <a target="_blank" class="get-nim" href="https://changelly.com/exchange/eur/nim?ref_id=v06xmpbqj5lpftuj">Get NIM</a>
                    <a target="_blank" class="apps" href="https://nimiq.com/#apps">Apps</a>
                    <WalletSelectorProvider class="desktop mobile-hidden" />
                    <div class="x-settings"></div>
                </nav>
            </div>
            <WalletSelectorProvider class="mobile mobile-inline-block" />
            <div class="x-total-amount"></div>
            <div class="header-bottom content-width">
                <div v-if="showBackupWords" class="backup-reminder words">
                    <a class="action" backup-words @click="exportWords(activeWallet.id)">
                        <div class="icon words">
                            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M20.13 33.15l-2.2 2.2c-.2.2-.52.2-.72 0l-2.2-2.2a.52.52 0 0 1-.15-.37V30.9l-1.7-.95a1.04 1.04 0 0 1 .15-1.88l1.55-.58v-1.06l-2.04-1.5a1.04 1.04 0 0 1 .15-1.76l1.89-.95v-3.38a7.77 7.77 0 1 1 5.42 0v13.95c0 .14-.05.27-.15.37zM16.47 7.52a1.55 1.55 0 1 0 2.2 2.2 1.55 1.55 0 0 0-2.2-2.2z" fill="#fff"/></svg>
                        </div>
                        <strong class="text">Backup your Account with Recovery Words.</strong>
                    </a>
                    <a class="dismiss display-none" dismiss-backup-words>&times;<span> dismiss</span></a>
                </div>
                <div v-if="showBackupFile" class="backup-reminder file">
                    <a class="action" backup-file @click="exportFile(activeWallet.id)">
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
                    <button new-tx @click="newTransactionFrom()">
                        <span>Send</span>
                    </button>
                    <div class="btn-text">Send</div>
                </div>
                <div class="floating-btn">
                    <button receive @click="receive()">
                        <span>Receive</span>
                    </button>
                    <div class="btn-text">Receive</div>
                </div>
                <div class="floating-btn">
                    <button icon-qr @click="scan()"><span>Scan</span></button>
                    <div class="btn-text">Scan</div>
                </div>
            </nav>
            <div class="x-view-dashboard content-width">
                <div class="x-card" style="max-width: 960px;">
                    <h2>Transactions</h2>
                    <div class="x-transactions no-animation" only-recent></div>
                </div>
                <div class="x-card" style="max-width: 552px;">
                    <h2>Addresses</h2>
                    <div class="x-accounts"></div>
                </div>
                <div class="x-card" style="max-width: 344px;">
                    <ContactListProvider class="v-contact-list" />
                </div>
            </div>
            <div class="x-send-transaction-modal"></div>
            <div class="v-contact-list-modal"></div>
            <div class="x-transaction-modal"></div>
            <div class="x-receive-request-link-modal"></div>
            <div class="x-create-request-link-modal"></div>
            <div class="x-disclaimer-modal"></div>
        </section>
        <footer class="nimiq-dark">
            <div class="x-network-indicator"></div>
            <div>&copy; 2017-2019 Nimiq Foundation</div>
            <a disclaimer @click="showDisclaimer">Disclaimer</a>
        </footer>
    </div>
</template>

<script lang="ts">
import { Component, Watch, Vue, Prop } from 'vue-property-decorator';
import { LoadingSpinner } from '@nimiq/vue-components';
import { BrowserDetection } from '@nimiq/utils';

import hubClient from './hub-client.js';
import Config from './config/config.js';
import ContactListProvider from './components/ContactListProvider.vue';
import { WalletType } from './redux/wallet-redux.js';
import ReduxProvider from './components/ReduxProvider.vue';
import WalletSelectorProvider from './components/WalletSelectorProvider.vue';
import NetworkHandler from './NetworkHandler.js';

import MixinSingleton from './elements/mixin-singleton.js';
import XAccounts from './elements/x-accounts/x-accounts.js';
import XTransactions from './elements/x-transactions/x-transactions.js';
import XTransactionModal from './elements/x-transactions/x-transaction-modal.js';
import XReceiveRequestLinkModal from './elements/x-request-link/x-receive-request-link-modal.js';
import XCreateRequestLinkModal from './elements/x-request-link/x-create-request-link-modal.js';
import XDisclaimerModal from './elements/x-disclaimer-modal.js';
import XSendTransactionModal from './elements/x-send-transaction/x-send-transaction-modal.js';
import XTotalAmount from './elements/x-total-amount.js';
import XSettings from './elements/x-settings/x-settings.js';
import XNetworkIndicator from './elements/x-network-indicator/x-network-indicator.js';
import VContactListModal from './elements/v-contact-list/v-contact-list-modal.js';

import './lib/nimiq-style/nimiq-style.css';
import '@nimiq/vue-components/dist/NimiqVueComponents.css';
import { spaceToDash } from './lib/parameter-encoding.js';

@Component({ components: {
    LoadingSpinner,
    ContactListProvider,
    WalletSelectorProvider,
} })
export default class App extends Vue {
    @Prop(Boolean) public showBackupFile!: boolean;
    @Prop(Boolean) public showBackupWords!: boolean;
    @Prop(Object) public activeWallet!: any;
    @Prop(Object) public activeAddressInfo!: any;

    private showReceiveModal = false;
    private showPrivateBrowsingWarning = false;
    private logoUrl = 'https://' + Config.tld;

    public async created() {
        const networkHandler = new NetworkHandler();
        networkHandler.launch();
        hubClient.launch();
        if (await BrowserDetection.isPrivateMode()) {
            this.showPrivateBrowsingWarning = true;
        }
    }

    public async mounted() {
        const $appContainer = this.$el;
        MixinSingleton.appContainer = $appContainer;

        /* tslint:disable:no-unused-expression */
        new XTotalAmount(this.$el.querySelector('.x-total-amount'));
        new XTransactions(this.$el.querySelector('.x-transactions'));
        new XSendTransactionModal(this.$el.querySelector('.x-send-transaction-modal'));
        new XAccounts(this.$el.querySelector('.x-accounts'));
        new XSettings(this.$el.querySelector('.x-settings'));
        new XNetworkIndicator(this.$el.querySelector('.x-network-indicator'));
        new XReceiveRequestLinkModal(this.$el.querySelector('.x-receive-request-link-modal'));
        new XCreateRequestLinkModal(this.$el.querySelector('.x-create-request-link-modal'));
        new XTransactionModal(this.$el.querySelector('.x-transaction-modal'));
        new XDisclaimerModal(this.$el.querySelector('.x-disclaimer-modal'));
        new VContactListModal(this.$el.querySelector('.v-contact-list-modal'));
        /* tslint:enable:no-unused-expression */

        setTimeout(() => document.body.classList.remove('preparing'));
    }

    private get root() {
        return `${window.location.host}`;
    }

    private get isTestnet() {
        return Config.network === 'test';
    }

    private newTransactionFrom(address: string) {
        if (address) {
            XSendTransactionModal.show(`${ spaceToDash(address) }`, 'sender');
        } else {
            XSendTransactionModal.show();
        }
    }

    private showDisclaimer() {
        XDisclaimerModal.show();
    }

    private exportWords(id: number) {
        hubClient.exportWords(id);
    }

    private exportFile(id: number) {
        hubClient.exportWords(id);
    }

    private receive() {
        XCreateRequestLinkModal.show();
        // this.showReceiveModal = true;
    }

    private scan() {
        XSendTransactionModal.show(null, 'scan');
    }

    /*private async signTransaction(tx: any) {
        // To allow for airgapped transaction creation, the validityStartHeight needs
        // to be allowed to be set by the user. Thus we need to parse what the user
        // put in and react accordingly.

        const setValidityStartHeight = parseInt(tx.validityStartHeight.trim());

        if (isNaN(setValidityStartHeight) && !this.height) {
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
            XSendTransactionOfflineModal.instance.transaction = signedTx;
            XSendTransactionOfflineModal.show();
        } else {
            this._sendTransactionNow(signedTx);
        }
    }

    async _sendTransactionNow(signedTx) {
        if (!signedTx) return;

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
    }*/

    /*
     if (this.properties.walletsLoaded && !this.properties.activeWallet) {
            hubClient.onboard();
            return;
        }

    listeners() {
        return {
            'x-send-transaction': this._signTransaction.bind(this),
            'x-send-prepared-transaction': this._clickedPreparedTransaction.bind(this),
            'x-send-prepared-transaction-confirm': this._sendTransactionNow.bind(this),
        }
    }*/

}
</script>

<style>
@import './elements/x-router/x-router.css';
@import './elements/x-accounts/x-accounts.css';
@import './elements/x-transactions/x-transactions.css';
@import './elements/x-toast/x-toast.css';
@import './elements/x-amount/x-amount.css';
@import './elements/x-network-indicator/x-network-indicator.css';
@import './elements/x-send-transaction/x-send-transaction-modal.css';
@import './elements/x-request-link/x-receive-request-link-modal.css';
@import './elements/x-request-link/x-create-request-link-modal.css';
@import './elements/x-settings/x-settings.css';
@import './elements/x-faucet-modal.css';

html,
body {
    overflow-x: hidden;
    background: #fafafa;
    display: initial;
}

.header-warning {
    padding: 15px;
    background: var(--nimiq-gold);
    background-image: var(--nimiq-gold-bg);
    color: #3b3b3b;
    text-align: center;
    /* font-weight: 600; */
}

.header-warning:not(.display-none) + .header-warning {
    border-top: 1px solid #333;
}

.header-warning .close-warning {
    float: right;
    color: #3b3b3b;
    cursor: pointer;
}

header {
    width: 100%;
    background: var(--nimiq-blue);
    background-image: var(--nimiq-blue-bg);
    color: white;
    text-align: center;
    padding: 0 0.5em;
    /* border-bottom: 3px solid var(--success-color); */
    box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.12);
}

.content-width {
    max-width: var(--max-content-width);
    margin: 0 auto;
}

.header-top {
    padding: 1em 1.2em;
    height: 54px;
}

.logo {
    color: white;
    float: left;
}

.secondary-links {
    float: right;
}

.secondary-links a {
    display: inline-block;
    margin-left: 30px;
    opacity: 0.7;
    transition: opacity 200ms;
    font-size: 16px;
    line-height: 20px;
    vertical-align: text-bottom;
}

.secondary-links .get-nim,
.secondary-links .apps {
    font-weight: bold;
}

.secondary-links a:hover,
.secondary-links a:focus {
    opacity: 1;
}

.secondary-links .get-nim::before,
.secondary-links .apps::before {
    width: 20px;
    height: 20px;
    background-repeat: no-repeat;
    background-position: center;
    display: inline-block;
    background-size: 100%;
    background-size: contain;
}

.secondary-links .get-nim::before {
    content: '';
    margin-right: 8px;
    vertical-align: text-bottom;
    background-size: 125%;
    background-image: url('data:image/svg+xml,<svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5139 18.4826C13.1117 18.8276 13.876 18.6228 14.2212 18.0251L18.4326 10.7307C18.4602 10.6828 18.5058 10.6477 18.5593 10.6334C18.6127 10.6191 18.6697 10.6266 18.7176 10.6544L19.6196 11.1745C19.811 11.285 20.0384 11.315 20.2519 11.2578C20.3246 11.2387 20.3943 11.2096 20.459 11.1713C20.7167 11.0183 20.8724 10.7387 20.8668 10.4391L20.7875 5.58076C20.7823 5.28816 20.6241 5.01969 20.3706 4.87347C20.1171 4.72725 19.8055 4.72472 19.5497 4.8668L15.3011 7.2251C15.0403 7.37123 14.8778 7.64586 14.8751 7.9448C14.8725 8.24373 15.0302 8.52117 15.2884 8.67184L16.1907 9.19274C16.29 9.2503 16.3241 9.37737 16.2668 9.47688L12.0556 16.7721C11.889 17.0595 11.8437 17.4015 11.9297 17.7225C12.0157 18.0434 12.2259 18.3169 12.5139 18.4826V18.4826Z" fill="white"/><path d="M10.2922 6.43794L5.8465 13.6467C5.78762 13.7428 5.66277 13.7744 5.5653 13.7177L4.87456 13.3196C4.61464 13.1696 4.29413 13.1709 4.03546 13.3231C3.77678 13.4752 3.61991 13.7547 3.62475 14.0548L3.70669 18.9133C3.71114 19.1698 3.83345 19.4099 4.03826 19.5643C4.24308 19.7187 4.50758 19.7702 4.75535 19.7038C4.82127 19.6861 4.88478 19.6604 4.94448 19.6273L9.19304 17.269C9.45347 17.1228 9.61574 16.8484 9.6184 16.5498C9.62106 16.2511 9.4637 15.9739 9.20591 15.8231L8.09263 15.181C8.04403 15.1524 8.00883 15.1056 7.99483 15.051C7.98092 14.9964 7.99003 14.9384 8.02003 14.8907L12.4224 7.74877C12.6728 7.3684 12.6965 6.88193 12.4843 6.47899C12.2721 6.07605 11.8576 5.8204 11.4023 5.81168C10.9469 5.80296 10.5229 6.04256 10.2954 6.43708L10.2922 6.43794Z" fill="white"/></svg>');
}

.secondary-links .apps::before {
    content: '';
    width: 16px;
    height: 16px;
    margin-right: 8px;
    margin-bottom: 2px;
    vertical-align: text-bottom;
    background-image: url('data:image/svg+xml,<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g><path d="M7.91139 3.22222L6.24472 0.333333C6.12583 0.126667 5.90472 0 5.66694 0H2.33361C2.09583 0 1.87583 0.127778 1.75694 0.333333L0.0891667 3.22222C-0.0297222 3.42889 -0.0297222 3.68222 0.0891667 3.88889L1.75583 6.77778C1.87472 6.98444 2.09583 7.11111 2.33361 7.11111H5.66694C5.90472 7.11111 6.12472 6.98333 6.24361 6.77778L7.91028 3.88889C8.03028 3.68333 8.03028 3.42889 7.91139 3.22222Z" fill="white"/><path d="M7.91139 12.1109L6.24472 9.22201C6.12583 9.01534 5.90472 8.88867 5.66694 8.88867H2.33361C2.09583 8.88867 1.87583 9.01645 1.75694 9.22201L0.0891667 12.1109C-0.0297222 12.3176 -0.0297222 12.5709 0.0891667 12.7776L1.75583 15.6664C1.87472 15.8731 2.09583 15.9998 2.33361 15.9998H5.66694C5.90472 15.9998 6.12472 15.872 6.24361 15.6664L7.91028 12.7776C8.03028 12.572 8.03028 12.3176 7.91139 12.1109Z" fill="white"/><path d="M15.9114 7.66656L14.2447 4.77767C14.1258 4.571 13.9047 4.44434 13.6669 4.44434H10.3336C10.0958 4.44434 9.87583 4.57211 9.75694 4.77767L8.08917 7.66656C7.97028 7.87322 7.97028 8.12656 8.08917 8.33322L9.75583 11.2221C9.87472 11.4288 10.0958 11.5554 10.3336 11.5554H13.6669C13.9047 11.5554 14.1247 11.4277 14.2436 11.2221L15.9103 8.33322C16.0303 8.12767 16.0303 7.87322 15.9114 7.66656Z" fill="white"/></g></svg>');
}

x-total-amount {
    display: block;
    font-size: 2.5em;
    margin: 0.5em auto 1em auto;
}

.header-bottom {
    overflow: visible;
    padding: 0.5em 1em;
    text-align: left;
    height: 51px; /* To not collapse when backup-reminder is not displayed */
}

.backup-reminder {
    font-size: 16px;
    transition: transform 200ms;
}

.backup-reminder:hover {
    transform: translateY(2px);
}

.backup-reminder .action {
    cursor: pointer;
    display: flex;
    flex-direction: row;
    align-items: flex-end;
}

.backup-reminder.words .action {
    color: var(--nimiq-orange);
}

.backup-reminder.file .action {
    color: var(--nimiq-green);
}

.backup-reminder .icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: inline-block;
    margin-bottom: -24px;
    box-shadow: 0 5px 15px 0px rgba(0, 0, 0, 0.2);
    margin-right: 13px;
    flex-shrink: 0;
}

.backup-reminder .icon.words {
    background: var(--nimiq-orange);
    background-image: var(--nimiq-orange-bg);
}

.backup-reminder .icon.file {
    background: var(--nimiq-green);
    background-image: var(--nimiq-green-bg);
}

.backup-reminder .icon svg {
    margin: 12px 0 -16px 13px;
}

.backup-reminder .dismiss {
    opacity: 0.5;
    cursor: pointer;
}

.backup-reminder .dismiss span {
    display: none;
}

.backup-reminder .dismiss:hover {
    opacity: 0.8;
}

.backup-reminder .dismiss:hover span {
    display: inline;
}


.x-view-dashboard,
.x-view-history,
.x-view-settings {
    padding: 1em 0;
    justify-content: center;
    flex-wrap: wrap;
    align-items: flex-start;
}

.x-view-dashboard {
    align-items: stretch;
}

.x-card {
    display: block;
    width: 100%;
    max-width: 960px;
    border-radius: 0.4em;
    padding: 1em;
    margin: 0.5em;
    background: white;
    box-shadow: 0 4px 24px -8px rgba(0, 0, 0, 0.25);
}

@media (min-width: 481px) {
    .x-card {
        padding: 24px ;
        margin: 16px;
    }
}

.x-card h2 {
    margin-bottom: 23px;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    font-size: 13px;
    font-weight: bold;
}

.x-card .contact-list .list {
    overflow: auto;
    min-height: 150px;
}

footer {
    text-align: center;
    padding: 1em;
    transition: opacity 0.5s linear 0.1s;
    font-size: 13px;
    margin-top:  80px;
}

footer > a,
footer > div {
    opacity: .6;
}

footer > a {
    text-decoration: underline;
    cursor: pointer;
}

body.preparing > * {
    visibility: hidden !important;
}

body.preparing footer {
    opacity: 0;
}

.x-disclaimer-modal {
    width: 690px;
}

.x-disclaimer-modal p {
    text-align: justify;
}

.x-disclaimer-modal p + p {
    margin-top: 1em;
}

.waiting {
    cursor: wait;
    color: #949292 !important;
    pointer-events: none;
}

button.waiting {
    background-color: transparent;
}

nav.actions.floating-actions {
    margin-bottom: -16px;
    display: flex;
    justify-content: flex-end;
    padding-right: 16px;
    float: none;
}

.floating-btn {
    text-align: center;
    width: 96px;
    margin-top: -45px;
}

.floating-btn button {
    width: 60px !important;
    height: 60px !important;
    border-radius: 50%;
    background-color: white;
    background-position: center !important;
    background-repeat: no-repeat !important;
    margin-left: 0;
    padding: 0;
    min-height: 0;
    box-shadow: 0 5px 15px 0px rgba(0, 0, 0, 0.2);
    transition: transform 200ms;
    background-size: 45% 45% !important;
    position: relative;
    overflow: hidden;
}

.floating-btn button span {
    display: none;
}

.floating-btn .btn-text {
    padding-top: 8px;
    user-select: none;
    opacity: 0.8;
}

.floating-btn button:disabled {
    border: 1px solid transparent;
    background-blend-mode: luminosity;
    background-color: white;
}

.floating-btn button:disabled::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, .4);
}

.floating-btn button:disabled + .btn-text {
    opacity: 0.6;
}

.floating-btn button[new-tx] {
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" fill="%230582CA" viewBox="0 0 8 19"><path d="M4 18.2c.8 0 1.5-.7 1.5-1.5V7v-.2H7c.4 0 .7-.2.9-.5a1 1 0 0 0 0-1L4.9.5A1 1 0 0 0 4 0a1 1 0 0 0-.9.5l-3 4.8a1 1 0 0 0 0 1c.2.3.5.4.9.4h1.2c.2 0 .3.2.3.3v9.7c0 .8.7 1.5 1.5 1.5z"/></svg>');
}

.floating-btn button[receive] {
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" fill="%230582CA" viewBox="0 0 8 19"><path d="M4 0c-.8 0-1.5.6-1.5 1.4v10H1a1 1 0 0 0-.9.5 1 1 0 0 0 0 1l3 4.8c.2.3.5.5.9.5s.7-.2.9-.5l3-4.8a1 1 0 0 0 0-1 1 1 0 0 0-.9-.5H5.8a.2.2 0 0 1-.3-.2V1.4C5.5.6 4.8 0 4 0z"/></svg>');
}

.floating-btn button:hover {
    transform: translateY(2px);
}

.floating-btn button:hover ~ .btn-text {
    opacity: 1;
}

.mobile-inline-block {
    display: none !important;
}

.v-wallet-selector.desktop .v-wallet-menu {
    right: 0;
}

.v-wallet-selector.menu-active.desktop .v-wallet-menu {
    top: 4.25rem;
}

.v-wallet-selector.mobile .v-wallet-menu {
    left: 0;
    padding: 0 1rem;
    width: 100vw;
}

.v-wallet-selector.menu-active.mobile .v-wallet-menu {
    top: unset;
}

.v-wallet-selector.mobile .wallet-menu {
    margin: auto;
}

@media (max-width: 620px) {
    .mobile-hidden {
        display: none;
    }

    .mobile-inline-block {
        display: inline-block !important;
    }
}

@media (max-width: 1000px) {
    .header-top {
        padding-right: 1em;
    }

    .x-view-dashboard {
        flex-direction: column;
    }

    .x-view-dashboard > * {
        max-width: calc(100% - 32px) !important;
    }
}

@media (max-width: 690px) {
    .header-top {
        height: 10rem;
    }

    .secondary-links {
        margin-top: 0.5rem;
    }

    .secondary-links a {
        margin-left: 12px;
    }

    .secondary-links a:first-child {
        margin-left: 0;
    }

    .v-wallet-selector [active-wallet-label],
    .v-wallet-selector [active-wallet-label-mobile] {
        padding: 14px 8px;
        margin-left: 6px;
    }
}

/**
    * The point at which the main nav and the action buttons
    * in the header don't fit next to each other anymore
*/
@media (max-width: 730px) {
    .header-top {
        padding: 1em;
    }

    .x-total-amount {
        margin: 0.3em auto;
    }

    nav.actions.floating-actions {
        justify-content: center;
        padding-right: 0;
    }

    .floating-btn {
        margin: 16px 8px 0;
        width: auto;
    }

    .floating-btn button {
        width: 120px !important;
        height: 40px !important;
        border-radius: 20px;
        min-height: 40px;
        box-shadow: 0 2px 10px 0px rgba(0, 0, 0, 0.2);
        background-position: 12px center !important;
        line-height: 38px;
        padding-left: 40px;
        text-align: left;
    }

    .floating-btn button[icon-qr] {
        width: 100px !important;
        background-position: 16px center !important;
        padding-left: 44px;
    }

    .floating-btn button span {
        display: inline;
        color: #3b3b3b;
        /* font-size: 13px; */
        font-weight: normal;
        text-transform: none;
        letter-spacing: 0;
        font-family: inherit;
    }

    .floating-btn .btn-text {
        display: none;
    }

    .floating-btn button {
        background-size: 20px 20px !important;
    }
}

@media (max-width: 650px) {
    .header-bottom {
        margin-top: 32px;
        padding: 0 1em;
        height: 8rem;
        width: 40rem;
    }

    .backup-reminder .icon {
        width: 40px;
        height: 40px;
        margin-bottom: 0;
    }

    .backup-reminder .icon svg {
        width: 26px;
        height: 26px;
        margin: 7px;
    }
}

@media (max-width: 480px) {
    header {
        padding: 0;
    }

    nav.actions.floating-actions {
        justify-content: space-between;
    }

    .x-total-amount {
        font-size: 1.8em;
    }

    .x-view-dashboard > * {
        max-width: calc(100% - 1em) !important;
    }

    footer {
        margin-top: 32px;
    }
}

@media (max-width: 400px) {
    nav.actions.floating-actions .floating-btn:last-child {
        flex-grow: 1;
    }

    .floating-btn button[icon-qr] {
        width: 100% !important;
        background-position: center !important;
    }

    .floating-btn button[icon-qr] span {
        display: none;
    }
}
</style>
