<template>
    <div class="request-link-modal x-modal nimiq-dark">
        <div class="modal-header">
            <i x-modal-close class="material-icons">close</i>
            <h2>Transaction Request</h2>
        </div>
        <div class="modal-body">
            <div class="center">
                <div ref="x-accounts-dropdown" @x-account-selected.stop="_setAddress($event.detail)"></div>
                <ul>
                    <li>
                        <div class="address-label">Copy your address:</div>
                        <div ref="x-address"></div>
                    </li>
                    <li>
                        <div>Or create a transaction request link:</div>
                        <div class="spacing-top">
                            <div ref="x-amount-input" no-screen-keyboard @input="amount = xAmountInput.value"></div>
                        </div>
                        <div class="request-link-container spacing-top">
                            <div>
                                <div>Copy your link:</div>
                                <div class="request-link" @click="share">{{ link }}</div>
                            </div>
                            <div class="qr-code-container" @click="openQrCodeOverlay">
                                <QrCode :size="qrSize" :data="link" />
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
        <div ref="qr-code-overlay"></div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { QrCode } from '@nimiq/vue-components';
import { createRequestLink } from '@nimiq/utils';
import XAccountsDropdown from '../elements/x-accounts/x-accounts-dropdown';
import XAddress from '../elements/x-address/x-address';
import '../elements/x-address/x-address.css';
import XAmountInput from '../elements/x-amount-input/x-amount-input';
import XQrCodeOverlay from '../elements/x-qr-code-overlay/x-qr-code-overlay';
import Config from '../config/config.js';

@Component({ components: { QrCode } })
export default class RequestLinkModal extends Vue {
    private xAccountsDropdown!: XAccountsDropdown;
    private xAmountInput!: XAmountInput;
    private xAddress!: XAddress;
    private xQrCodeOverlay!: XQrCodeOverlay;
    private address: string = '';
    private amount: number = 0;

    private mounted() {
        this.xAccountsDropdown = new XAccountsDropdown(this.$refs['x-accounts-dropdown'] as HTMLElement);
        this.xAddress = new XAddress(this.$refs['x-address'] as HTMLElement);
        this.xAmountInput = new XAmountInput(this.$refs['x-amount-input'] as HTMLElement);
        this.xQrCodeOverlay = new XQrCodeOverlay(this.$refs['qr-code-overlay'] as HTMLElement);
    }

    private destroyed() {
        [ this.xAccountsDropdown, this.xAddress, this.xAmountInput, this.xQrCodeOverlay ].forEach((xE) => xE.destroy());
    }

    private _setAddress(address: string) {
        this.xAddress.address = address;
        this.address = address;
    }

    private get qrSize() {
        if (!this.isMobile()) return 72;
        const qrContainer = document.querySelector('.request-link-container') as HTMLDivElement;
        return qrContainer.offsetWidth - 20;
    }

    private get link() {
        if (!this.address) return null;
        const baseUrl = Config.offlinePackaged ? 'https://safe.nimiq.com' : window.location.host;
        return createRequestLink(this.address, this.amount, undefined, baseUrl);
    }

    private openQrCodeOverlay() {
        if (!this.link || this.isMobile()) return;
        this.xQrCodeOverlay.show(this.link, 'Scan this QR code\nto send to this address');
    }

    private isMobile() {
        return window.innerWidth <= 420;
    }

    private async share() {
        await import(/*webpackChunkName: "web-share-shim"*/ '@nimiq/web-share-shim');
        // @ts-ignore: method 'share' is added by the imported web-share-shim
        navigator.share({
            title: 'Nimiq Transaction Request',
            text: 'Please send me NIM using this link:',
            url: this.link,
        });
    }
}
</script>

<style scoped>
.request-link-modal {
  position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transition: background .4s ease-in-out;
    z-index: 1;
}
.request-link-modal {
    width: 600px;
}

.request-link-modal ul {
    padding-left: 20px;
    list-style: square;
    max-width: 100%;
}

.request-link-modal .address-label {
    margin-bottom: 4px;
}

.request-link-modal ul .x-address {
    margin-left: -15px;
}

.request-link-modal ul li:last-child {
    padding-bottom: 0;
}

.request-link-modal .request-link-container {
    display: flex;
    align-items: center;
}

.request-link-modal .request-link-container > * {
    overflow: auto;
    /* to have enough space to render request link hover background overflow */
    padding-left: 8px;
    margin-left: -8px;
}

.request-link-modal .request-link {
    cursor: pointer;
    font-weight: bold;
    overflow-wrap: break-word;
    padding: 8px;
    margin-left: -8px;
}

.request-link-modal .qr-code-container {
    margin-left: 32px;
    padding: 12px;
    margin-right: -12px;
    flex-shrink: 0;
    cursor: pointer;
}

.request-link-modal .qr-code-container canvas {
    display: block;
}

.request-link-modal .request-link:hover,
.request-link-modal .qr-code-container:hover {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 8px;
}

@media (max-width: 420px) {
    .request-link-modal .request-link-container {
        flex-direction: column-reverse;
        align-items: flex-start;
    }

    .request-link-modal .request-link-container > * {
        max-width: 100%;
    }

    .request-link-modal .qr-code-container {
        margin: 0 0 32px 0;
        background: transparent !important;
        cursor: auto;
        padding: 0;
    }
}
</style>
