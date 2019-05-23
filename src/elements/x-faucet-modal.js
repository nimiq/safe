import XElement from '../lib/x-element/x-element.js';
import MixinModal from './mixin-modal/mixin-modal.js';
import { default as store } from '../store.js';
import { activeAddresses$ } from '../selectors/account$.js';
import XSuccessMark from './x-success-mark/x-success-mark.js';
import XCaptcha from './x-captcha/x-captcha.js';

class Faucet {
    static async tap(recipientAddress, captcha) {
        const responseBody = {
            address: recipientAddress,
        };
        if (captcha) {
            if (captcha.provider) {
                responseBody['captcha-provider'] = captcha.provider;
            }
            if (captcha.provider === XCaptcha.Providers.RECAPTCHA) {
                responseBody['g-recaptcha-response'] = captcha.token;
            } else {
                responseBody['vaptcha-response'] = captcha.token;
            }
        }
        const response = await fetch(`${Faucet.FAUCET_BACKEND}${Faucet.FAUCET_ENDPOINT_TAP}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(responseBody)
        }).then(response => response.json());
        if (!response.success) {
            const error = new Error('Faucet error');
            error.error = response.error;
            error.msg = response.msg;
            throw error;
        }
    }

    static async info() {
        Faucet._infoPromise = Faucet._infoPromise
            || fetch(`${Faucet.FAUCET_BACKEND}${Faucet.FAUCET_ENDPOINT_INFO}`).then(response => response.json());
        return Faucet._infoPromise;
    }

    static async getDispenseAmount() {
        const info = await Faucet.info();
        return info.dispenseAmount; // in NIM
    }

    static async getFaucetAddress() {
        const info = await Faucet.info();
        return info.address;
    }
}
Faucet.FAUCET_BACKEND = window.location.origin.indexOf('nimiq.com') !== -1
    ? 'https://faucet.nimiq-network.com/' : 'https://faucet.nimiq-testnet.com/';
Faucet.CAPTCHA_REQUIRED = window.location.origin.indexOf('nimiq.com') !== -1;
Faucet.FAUCET_ENDPOINT_TAP = 'tapit';
Faucet.FAUCET_ENDPOINT_INFO = 'info';

export default class XFaucetModal extends MixinModal(XElement) {
    html() {
        return `
            <div class="modal-header">
                <i x-modal-close class="material-icons">close</i>
                <h2>Get Free <span class="testnet-nim-hint">Test</span> Nim</h2>
            </div>
            <div class="modal-body center">
                <div class="captcha">
                    <x-captcha></x-captcha>
                    <h3 class="status-message">Human after all?</h3>
                </div>
                <div class="loading">
                    <x-loading-animation></x-loading-animation>
                    <h3 class="status-message">Collecting Funds</h3>
                </div>
                <div class="success">
                    <x-success-mark></x-success-mark>
                    <h3 class="status-message">
                        <span dispense-amount>Your funds are</span> on the way!
                    </h3>
                </div>
                <div class="error">
                    <div class="nq-icon warning"></div>
                    <h3 error-message class="status-message"></h3>
                </div>
            </div>
        `;
    }

    styles() {
        return [ ...super.styles(), 'x-faucet-modal' ];
    }

    children() {
        return [ ...super.children(), XSuccessMark, XCaptcha ];
    }

    listeners() {
        return {
            [`${XCaptcha.Events.CAPTCHA_SOLVED} x-captcha`]: this._tapFaucet,
        };
    }

    onCreate() {
        super.onCreate();
        this.$modalBody = this.$('.modal-body');
        this.$errorMessage = this.$('[error-message]');
        this.$dispenseAmount = this.$('[dispense-amount]');
        if (window.location.origin.indexOf('nimiq.com') !== -1) {
            this.$el.querySelector('.testnet-nim-hint').remove();
        }
    }

    async onShow() {
        super.onShow();
        Faucet.getDispenseAmount().then(dispenseAmount =>
            this.$dispenseAmount.textContent = `${dispenseAmount} NIM ${dispenseAmount !== 1 ? 'are' : 'is'}`);
        if (Faucet.CAPTCHA_REQUIRED) {
            this._setState('captcha');
        } else {
            this._tapFaucet(null);
        }
    }

    _setState(state) {
        Array.prototype.forEach.call(this.$modalBody.children, $child => {
            if ($child.classList.contains(state)) $child.style.display = 'flex';
            else $child.style.display = 'none';
        });
    }

    async _tapFaucet(captcha) {
        const firstAddress = activeAddresses$(store.getState())[0];
        if (!firstAddress) {
            this.$errorMessage.textContent = 'Please first add an address to your account.';
            this._setState('error');
            return;
        }

        try {
            this._setState('loading');
            await Faucet.tap(firstAddress, captcha);
            this._setState('success');
            await new Promise(resolve => requestAnimationFrame(resolve));
            await this.$successMark.animate();
            this.hide();
        } catch(e) {
            this.$errorMessage.textContent = e.msg // faucet specific error message
                || e.message // message of Error constructor
                || 'Failed to claim funds.';
            this._setState('error');
        }
    }
}
