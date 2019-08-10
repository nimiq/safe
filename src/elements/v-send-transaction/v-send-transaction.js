import XElement from '../../lib/x-element/x-element.js'
import MixinRedux from '../mixin-redux.js'
import MixinModal from '../mixin-modal/mixin-modal.js'
import ReduxProvider from '../../../node_modules/vuejs-redux/bundle.es.js';
import { setContact } from '../v-contact-list/contacts-redux.js'
import { walletsArrayWithAccountMap$ } from '../../selectors/wallet$.js'
import hubClient from '../../hub-client.js';
import { accountsArray$ } from '../../selectors/account$.js';
import { dashToSpace } from '../../lib/parameter-encoding.js';

export default class VSendTransaction extends MixinModal(XElement) {
    html() {
        return `<div class="body vue-send-transaction">
                    <redux-provider :map-state-to-props="mapStateToProps" :store="store">
                        <send-tx
                            slot-scope="{contacts, wallets, validityStartHeight}"
                            :contacts="contacts"
                            :wallets="wallets"
                            :validity-start-height="validityStartHeight"
                            :sender="sender"
                            :recipient="recipient"
                            :value="amount"
                            :message="message"
                            @login="login"
                            @scan-qr="scanQr"
                            @send-tx="sendTx"
                            @contact-added="contactAdded"
                            @create-cashlink="createCashlink"
                        ></send-tx>
                    </redux-provider>
                </div>
                <transition class="qr-scanner" enter-active-class="fade-in" leave-active-class="fade-out">
                    <qr-scanner v-if="shown" @result="onQrScanned" @cancel="closeQrScanner"></qr-scanner>
                </transition>`;
    }

    styles() {
        return [ ...super.styles(), 'v-send-transaction' ];
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
                isLoading: this._isLoading,
                sender: this.sender,
                recipient: this.recipient,
                amount: this.amount,
                message: this.message,
            },
            methods: {
                mapStateToProps(state) {
                    return {
                        contacts: Object.values(state.contacts),
                        wallets: walletsArrayWithAccountMap$(state),
                        validityStartHeight: state.network.height,
                    };
                },
                login() {
                    hubClient.onboard();
                },
                scanQr() {
                    self._openQrScanner();
                },
                sendTx(tx) {
                    self.fire('x-send-transaction', tx);
                },
                contactAdded(contact) {
                    VSendTransaction.actions.setContact(contact.label, contact.address);
                },
                createCashlink(account) {
                    hubClient.createCashlink(account.address, account.balance);
                },
                setSender(address){
                    const accounts = accountsArray$(this.store.getState());
                    this.sender = {
                        address,
                        walletId: accounts.find(account => account.address === address).walletId,
                    };
                },
            },
            components: {
                'redux-provider': ReduxProvider,
                'send-tx': NimiqVueComponents.SendTx,
            }
        })
    }

    set loading(isLoading) {
        this._isLoading = !!isLoading;
    }


    /* mode: 'sender'|'recipient'|'contact'|'vesting'|'scan' */
    onShow(address, mode, amount, message, freeze) {
        if(address && mode === 'sender') {
            this.vue.setSender(dashToSpace(address));
        }

        if (address && (mode === 'recipient' || mode === 'vesting')) {
            this.vue.recipient = {address: dashToSpace(address)};
            console.error(this.vue);
        }

        if (amount) {
            this.vue.amount = amount * 1e5;
            // this.$amountInput.$input.setAttribute('readonly', true);
        } else {
            // this.$amountInput.$input.removeAttribute('readonly');
        }

        if (message) {
            this.vue.message = decodeURIComponent(message);

            if (typeof this.message === 'Uint8Array') {
                this.vue.message = Utf8Tools.utf8ByteArrayToString(message);
            }

            // this.$extraDataInput.$input.setAttribute('readonly', true);
        } else {
            // this.$extraDataInput.$input.removeAttribute('readonly');
        }

        if (mode === 'scan') {
            this._openQrScanner();
            this._isQrScanMode = true;
        } else {
            this._isQrScanMode = false;
        }
    }

    onHide() {
        setTimeout(() => this._closeQrScanner(true), 400);
    }

    _getQrScanner() {
        if (this._qrScanner) return this._qrScanner;
        this._qrScanner = new Vue({
            el: this.$('.qr-scanner'),
            data: () => ({
                shown: false,
            }),
            methods: {
                onQrScanned: this._onQrScanned.bind(this),
                closeQrScanner: this._closeQrScanner.bind(this),
            },
            components: {
                'qr-scanner': NimiqVueComponents.QrScanner,
                // @asset(/node_modules/@nimiq/vue-components/dist/qr-scanner-worker.min.js)
            }
        });
        return this._qrScanner;
    }

    _openQrScanner() {
        this._getQrScanner().shown = true;
    }

    _closeQrScanner(codeFound = false) {
        if (!this._qrScanner) return;
        if (codeFound || !this._isQrScanMode) {
            this._isQrScanMode = false;
            this._qrScanner.shown = false;
        }
        else if (this.hide) this.hide();
    }

    _onQrScanned(scanResult) {
        let recipient, amount, message;
        const parsedRequestLink = parseRequestLink(scanResult);
        if (parsedRequestLink) {
            ({ recipient, amount, message } = parsedRequestLink);
        } else if (ValidationUtils.isValidAddress(scanResult)) {
            recipient = scanResult;
        } else {
            return;
        }
        this.recipient = recipient; // required
        if (amount) this.amount = amount;
        if (message) this.message = message;
        this._closeQrScanner(true);
        this.validateAllFields();
    }
}
