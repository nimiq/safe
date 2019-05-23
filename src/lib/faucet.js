import XCaptcha from '../elements/x-captcha/x-captcha.js';

export default class Faucet {
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

        const timestamp = Date.now();
        localStorage[Faucet.KEY_LAST_TAPPED] = timestamp;
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

    static getLastTapped() {
        return localStorage[Faucet.KEY_LAST_TAPPED];
    }
}
Faucet.FAUCET_BACKEND = window.location.origin.indexOf('nimiq.com') !== -1
    ? 'https://faucet.nimiq-network.com/' : 'https://faucet.nimiq-testnet.com/';
Faucet.CAPTCHA_REQUIRED = window.location.origin.indexOf('nimiq.com') !== -1;
Faucet.FAUCET_ENDPOINT_TAP = 'tapit';
Faucet.FAUCET_ENDPOINT_INFO = 'info';
Faucet.KEY_LAST_TAPPED = 'faucet-last-tapped';
