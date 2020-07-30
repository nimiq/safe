import XElement from '../../lib/x-element/x-element.js'
import MixinModal from '../mixin-modal/mixin-modal.js'

export default class XWalletPreviewModal extends MixinModal(XElement) {
    static hasBeenSeen() {
        return !!localStorage[XWalletPreviewModal.KEY_PREVIEW_SEEN];
    }

    html() {
        return `
            <div class="message center">
                <div class="upgrade-icon"></div>

                <h1 class="nq-h1">
                    Upgrade now to<br>
                    the new Nimiq Wallet
                </h1>

                <p>
                    Benefit from advanced features, improved<br>
                    UI and massive upgrades soon to come.
                </p>

                <p class="nq-light-blue">
                    Safe and Wallet access the keys stored in<br>
                    your browser. You are logged in already!
                </p>

                <a href="https://wallet.nimiq.com/" target="_blank" class="nq-button light-blue">Open Nimiq Wallet</a>
                <a href="javascript:void(0)" class="nq-link">
                    Skip for now
                    <div class="caret-right-small-icon"></div>
                </a>
            </div>
            <div class="preview-image"></div>
        `;
    }

    listeners() {
        return {
            'click .nq-button': this._setPreviewSeen, // also opens wallet in new tab
            'click .nq-link': this._setPreviewSeen,
        };
    }

    onCreate() {
        super.onCreate();

        const CaretRightSmallIcon = Vue.extend({
            render: (createElement) => createElement(NimiqVueComponents.CaretRightSmallIcon),
        });
        this.$caretRightSmallIcon = new CaretRightSmallIcon({
            el: this.$('.caret-right-small-icon'),
        });
    }

    destroy() {
        this.$caretRightSmallIcon.$destroy();

        super.destroy();
    }

    _setPreviewSeen() {
        localStorage[XWalletPreviewModal.KEY_PREVIEW_SEEN] = 'true';
        this.hide();
    }
}
XWalletPreviewModal.KEY_PREVIEW_SEEN = 'wallet-preview-seen';
