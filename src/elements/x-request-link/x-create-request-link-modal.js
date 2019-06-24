/*import MixinModal from '../mixin-modal/mixin-modal.js';
import XElement from '../../lib/x-element/x-element.js';
import XAccountsDropdown from '../x-accounts/x-accounts-dropdown.js';
import XQrCodeOverlay from '../x-qr-code-overlay/x-qr-code-overlay';

export default class XCreateRequestLinkModal extends MixinModal(XElement) {
    onCreate() {
        this._shown = false;
        navigator.share = share;
        this.$requestLink = this.$('.x-request-link');
        this._qrCode = new QrCode({
            propsData: {
                size: this._isMobile()? this.$('.request-link-container').offsetWidth - 20 : 72
            }
        });
        this._qrCode.$mount(this.$('.qr-code'));
        super.onCreate();
    }

    listeners() {
        return {
            'x-account-selected': this._onAccountSelected.bind(this),
            'input x-amount-input': this._updateLink.bind(this),
            'click .x-request-link': () => navigator.share({
                title: 'Nimiq Transaction Request',
                text: 'Please send me Nimiq using this link:',
                url: this._link
            }),
            'click .qr-code-container': () => this._openQrOverlay(),
        }
    }

    onShow() {
        this._shown = true;
        this._updateLink();
    }

    onHide() {
        this._shown = false;
    }

    _onAccountSelected(address) {
        this._setAccount(address);
    }

    _setAccount(address) {
        this.$address.address = address;
        this._address = address;
        this._updateLink();
    }

    _updateLink() {
        if (!this._shown) return; // avoid rendering of qr code in background
        const baseUrl = Config.offlinePackaged
            ? 'https://safe.nimiq.com'
            : (this.attributes.dataXRoot || window.location.host);
        this._link = createRequestLink(this._address, this.$amountInput.value, null, baseUrl);
        this.$requestLink.textContent = this._link;
        this._qrCode.data = this._link;
    }

    _openQrOverlay() {
        if (this._isMobile()) return;
        this.$xQrCodeOverlay.show(this._link, 'Scan this QR code\nto send to this address');
    }
}*/
