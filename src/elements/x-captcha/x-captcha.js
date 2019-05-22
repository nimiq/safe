import XElement from '../../lib/x-element/x-element.js';
import LazyLoading from '../../lib/lazy-loading.js';

export default class XCaptcha extends XElement {
    onCreate() {
        super.onCreate();
        this.$captchaContainer = this.$el.querySelector('.captcha-container');
        this._instancePromise = XCaptcha._getApi().then(({ api, provider }) => {
            this.$el.classList.add(provider);
            if (provider === XCaptcha.Providers.RECAPTCHA) {
                return this._createRecaptchaInstance(api);
            } else {
                return this._createVaptchaInstance(api);
            }
        });
    }

    html() {
        return `
            <x-loading-animation></x-loading-animation>
            <div class="captcha-container"></div>
        `;
    }

    async getToken() {
        const instance = await this._instancePromise;
        return instance.getToken();
    }

    async getProvider() {
        const instance = await this._instancePromise;
        return instance.provider;
    }

    async reset() {
        const instance = await this._instancePromise;
        instance.reset();
    }

    async _createRecaptchaInstance(recaptchaApi) {
        const recaptchaSiteKey = XCaptcha.RECAPTCHA_SITE_KEY || this.attribute('recaptcha-site-key');
        if (!recaptchaSiteKey) throw new Error('Recpatcha Site Key not set');
        const recaptchaId = recaptchaApi.render(this.$captchaContainer, {
            'sitekey': recaptchaSiteKey,
            'callback': (token) =>
                this.fire(XCaptcha.Events.CAPTCHA_SOLVED, { token, provider: XCaptcha.Providers.RECAPTCHA }),
            'expired-callback': () => this.fire(XCaptcha.Events.CAPTCHA_EXPIRED)
        });
        return {
            getToken: recaptchaApi.getResponse.bind(recaptchaApi, recaptchaId),
            reset: recaptchaApi.reset.bind(recaptchaApi, recaptchaId),
            provider: XCaptcha.Providers.RECAPTCHA
        };
    }

    async _createVaptchaInstance(vaptchaApi) {
        const vaptchaSiteKey = XCaptcha.VAPTCHA_SITE_KEY || this.attribute('vaptcha-site-key');
        if (!vaptchaSiteKey) throw new Error('Vaptcha Site Key not set');
        const vaptchaScene = this.attribute('vaptcha-scene') || XCaptcha.VAPTCHA_SCENE;
        const options = {
            vid: vaptchaSiteKey,
            type: 'click',
            container: this.$captchaContainer,
            lang: 'en',
            https: true,
            style: 'light'
        };
        if (vaptchaScene) {
            options.scene = vaptchaScene;
        }
        const instance = await vaptchaApi(options);
        let token = null;
        let expirationTimeout = null;

        const getToken = () => {
            if (token) return token;
            token = instance.getToken(); // store the token as the token is reset when retrieved
            return token;
        };

        const reset = () => {
            clearTimeout(expirationTimeout);
            token = null;
            instance.reset();
        };

        instance.listen('pass', () => {
            this.fire(XCaptcha.Events.CAPTCHA_SOLVED, { token: getToken(), provider: XCaptcha.Providers.VAPTCHA });
            clearTimeout(expirationTimeout);
            // vaptcha token expires after 3 min
            expirationTimeout = setTimeout(() => {
                reset();
                this.fire(XCaptcha.Events.CAPTCHA_EXPIRED);
            }, 3 * 60 * 1000 - 3000); // subtract 3s to take network delays into account
        });
        instance.render();

        return { getToken, reset, provider: XCaptcha.Providers.VAPTCHA };
    }

    static async _getApi() {
        XCaptcha._apiPromise = XCaptcha._apiPromise || new Promise(async (resolve, reject) => {
            let provider;
            try {
                const geoIpResponse = await fetch(XCaptcha.GEOIP_SERVER);
                if (geoIpResponse.status !== 200) throw new Error('Failed to contact geoip server');
                const geoIpInfo = await geoIpResponse.json();
                const country = (geoIpInfo.country || 'us').toLowerCase();
                provider = country === 'cn'? XCaptcha.Providers.VAPTCHA : XCaptcha.Providers.RECAPTCHA;
            } catch (e) {
                // default to recaptcha
                provider = XCaptcha.Providers.RECAPTCHA;
                console.warn('Failed to determine which captcha provider to use, defaulting to RECAPTCHA.');
            }
            try {
                const apiReadyPromise = new Promise(resolve => {
                    if (provider === XCaptcha.Providers.VAPTCHA) {
                        resolve();
                        return;
                    }
                    window.onRecaptchaReady = () => {
                        delete window.onRecaptchaReady;
                        resolve();
                    }
                });
                const apiSrcPromise = LazyLoading.loadScript(provider === XCaptcha.Providers.RECAPTCHA
                    ? XCaptcha.ApiSrc.RECAPTCHA : XCaptcha.ApiSrc.VAPTCHA);
                await Promise.all([apiSrcPromise, apiReadyPromise]);
                const api = provider === XCaptcha.Providers.RECAPTCHA ? window.grecaptcha : window.vaptcha;
                resolve({ api, provider });
            } catch(e) {
                XCaptcha._apiPromise = null;
                reject(e);
            }
        });
        return XCaptcha._apiPromise;
    }
}
XCaptcha.Events = {
    CAPTCHA_SOLVED: 'x-captcha-solved',
    CAPTCHA_EXPIRED: 'x-captcha-expired'
};
XCaptcha.Providers = {
    RECAPTCHA: 'recaptcha',
    VAPTCHA: 'vaptcha'
};
XCaptcha.ApiSrc = {
    RECAPTCHA: 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaReady&render=explicit',
    VAPTCHA: 'https://cdn.vaptcha.com/v2.js'
};
XCaptcha.GEOIP_SERVER = 'https://geoip.nimiq-network.com:8443/v1/locate';

XCaptcha.RECAPTCHA_SITE_KEY = '6Le0kXQUAAAAAK6vGYfpxqSrPd-TN4p0ms5kCn6m';
XCaptcha.VAPTCHA_SITE_KEY = window.location.origin.indexOf('nimiq.com') !== -1
    ? '5b92ccdffc650e0ee0a0f093' : '5c9a07ebfc650e4c10e1ade4';
XCaptcha.VAPTCHA_SCENE = '02'; // safe

