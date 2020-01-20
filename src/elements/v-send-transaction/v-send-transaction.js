import XElement from '../../lib/x-element/x-element.js'
import MixinRedux from '../mixin-redux.js'
import MixinModal from '../mixin-modal/mixin-modal.js'
import ReduxProvider from '../../../node_modules/vuejs-redux/bundle.es.js';
import { setContact } from '../v-contact-list/contacts-redux.js'
import { activeWalletWithAccountMap$ } from '../../selectors/wallet$.js'
import hubClient from '../../hub-client.js';
import { accountsArray$ } from '../../selectors/account$.js';
import { dashToSpace } from '../../lib/parameter-encoding.js';
import { ValidationUtils } from '../../../node_modules/@nimiq/utils/dist/module/ValidationUtils.js';
import { parseRequestLink } from '../../../node_modules/@nimiq/utils/dist/module/RequestLinkEncoding.js';
import { Store } from '../../store.js';

export default class VSendTransaction extends MixinRedux(MixinModal(XElement)) {
    html() {
        return `<div class="body vue-send-transaction">
                    <redux-provider :map-state-to-props="mapStateToProps" :store="store">
                        <send-tx
                            slot-scope="{contacts, wallet, addresses, validityStartHeight}"
                            :contacts="contacts"
                            :wallet="wallet"
                            :addresses="addresses"
                            :validity-start-height="validityStartHeight"
                            :sender="sender"
                            :recipient="recipient"
                            :recipient-is-readonly="recipientIsReadonly"
                            :value="amount"
                            :message="message"
                            :is-loading="isLoading"
                            @login="login"
                            @scan-qr="scanQr"
                            @send-tx="sendTx"
                            @contact-added="contactAdded"
                            @create-cashlink="createCashlink"
                            @back="back"
                            ref="sendTx"
                        ></send-tx>
                    </redux-provider>
                    <transition class="qr-scanner" enter-active-class="fade-in" leave-active-class="fade-out">
                        <qr-scanner v-if="qrScannerShown" @result="onQrScanned" @cancel="closeQrScanner"></qr-scanner>
                    </transition>
                </div>`;
    }

    static get actions() {
        return {
            setContact,
        }
    }

    onCreate() {
        super.onCreate();
        const self = this;

        this._isQrScanMode = false;

        this.vue = new Vue({
            el: this.$('.vue-send-transaction'),
            data: {
                store: MixinRedux.store,
                isLoading: false,
                sender: null,
                recipient: null,
                recipientIsReadonly: false,
                amount: 0,
                message: '',
                qrScannerShown: false,
            },
            methods: {
                mapStateToProps(state) {
                    return {
                        contacts: Object.values(state.contacts),
                        wallet: activeWalletWithAccountMap$(state),
                        addresses: accountsArray$(state),
                        validityStartHeight: state.network.height,
                    };
                },
                login() {
                    hubClient.onboard();
                },
                scanQr() {
                    this.qrScannerShown = true;
                },
                sendTx(tx) {
                    self.fire('x-send-transaction', tx);
                },
                contactAdded(contact) {
                    self.actions.setContact(contact.label, contact.address);
                    Store.persistContacts();
                },
                createCashlink(account) {
                    hubClient.createCashlink(account.address, account.balance).then((result) => result && self.hide());
                },
                setSender(address) {
                    const accounts = accountsArray$(this.store.getState());
                    const account = accounts.find(account => account.address === address);
                    if (!account) return;
                    this.sender = {
                        address,
                        walletId: account.walletId,
                    };
                },
                onQrScanned: this._onQrScanned.bind(this),
                closeQrScanner: this._closeQrScanner.bind(this),
                back() {
                    window.history.back();
                },
            },
            components: {
                'redux-provider': ReduxProvider,
                'send-tx': NimiqVueComponents.SendTx,
                'qr-scanner': NimiqVueComponents.QrScanner,
                // @asset(/node_modules/@nimiq/vue-components/dist/qr-scanner-worker.min.js)
            }
        });
    }

    set loading(value) {
        this.vue.isLoading = value;
    }

    clearProps() {
        this.vue.sender = null;
        this.vue.recipient = null;
        this.vue.recipientIsReadonly = false;
        this.vue.amount = 0;
        this.vue.message = '';
        // this.vue.fee = null;
        this.vue.isLoading = false;
    }

    clear() {
        this.vue.$refs.sendTx.clear();
    }

    /* mode: 'sender'|'recipient'|'contact'|'vesting'|'scan' */
    onShow(address, mode, amount, message) {
        if (address && mode === 'sender') {
            this.vue.setSender(dashToSpace(address));
        }

        if (address && (mode === 'recipient' || mode === 'vesting' || mode === 'contact')) {
            this.vue.recipient = {address: dashToSpace(address)};
            this.vue.recipientIsReadonly = true;
        } else {
            this.vue.recipientIsReadonly = false;
        }

        if (amount) {
            this.vue.amount = amount * 1e5;
        }

        if (message) {
            this.vue.message = decodeURIComponent(message);
        }

        if (mode === 'scan') {
            this._isQrScanMode = true;
            this._openQrScanner();
        } else {
            this._isQrScanMode = false;
            this.vue.$refs.sendTx.focus(true);
        }
    }

    onHide() {
        setTimeout(() => {
            this.clearProps();
            this._closeQrScanner(true);
        }, 400);
    }

    _openQrScanner() {
        this.vue.qrScannerShown = true;
    }

    _closeQrScanner(codeFound = false) {
        if (codeFound || !this._isQrScanMode) {
            this._isQrScanMode = false;
            this.vue.qrScannerShown = false;
        }
        else this.hide();
    }

    _isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (e) {
            return false;
        }
    }

    _onQrScanned(scanResult) {
        let recipient, amount, message;
        const parsedRequestLink = parseRequestLink(scanResult, /* requiredBasePath */ undefined, true);
        if (parsedRequestLink) {
            ({ recipient, amount, message } = parsedRequestLink);
        } else if (ValidationUtils.isValidAddress(scanResult)) {
            recipient = scanResult;
        } else if (this._isValidUrl(scanResult)) {
            window.location.href = scanResult;
            return;
        } else {
            // TODO: Show notice, that QR code content is not supported, to the user.
            return;
        }
        this.vue.recipient = {address: recipient}; // required
        this.vue.recipientIsReadonly = this._isQrScanMode;
        if (amount) this.vue.amount = amount;
        if (message) this.vue.message = message;
        this._closeQrScanner(true);
    }
}
