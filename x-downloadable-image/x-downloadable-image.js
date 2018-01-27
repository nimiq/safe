import XElement from "/library/x-element/x-element.js";
import XToast from "../x-toast/x-toast.js";

export default class XDownloadableImage extends XElement {
    static get LONG_TOUCH_DURATION() {
        return 750;
    }

    html() {
        return `
            <a>
                <img>
                <svg long-touch-indicator xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
                    <defs>
                        <clipPath id="hexClip">
                            <path clip-rule="evenodd" d="M16 4.29h32l16 27.71l-16 27.71h-32l-16 -27.71zM20.62 12.29h22.76l11.38 19.71l-11.38 19.71h-22.76l-11.38 -19.71z"/>
                        </clipPath>
                    </defs>
                    <path fill-rule="evenodd" d="M16 4.29h32l16 27.71l-16 27.71h-32l-16 -27.71zM20.62 12.29h22.76l11.38 19.71l-11.38 19.71h-22.76l-11.38 -19.71z" fill="#FFFFFF" opacity="0.2"/>
                    <g clip-path="url(#hexClip)">
                        <circle id="circle" cx="32" cy="32" r="16" fill="none" stroke-width="32" stroke="#F6AE2D" stroke-dasharray="100.53 100.53" transform="rotate(-120 32 32)"/>
                    </g>
                </svg>
            </a>`;
    }

    onCreate() {
        this._src = null;
        this._filename = 'image';
        this._longTouchStart = 0;
        this._indicatorHideTimeout = null;
        this.$img = this.$('img');
        this.$a = this.$('a');
        this.$longTouchIndicator = this.$('[long-touch-indicator]');
        this._onWindowBlur = this._onWindowBlur.bind(this);
        this.$a.addEventListener('mousedown', e => this._onDownloadStart());
        this.$a.addEventListener('touchstart', e => this._onTouchStart());
        this.$a.addEventListener('touchend', e => this._onTouchEnd());
    }

    children() {
        return [XToast];
    }

    set src(src) {
        this._src = src;
        this.$img.src = src;
        this._setupDownload();
    }

    set filename(filename) {
        this._filename = filename;
        this._setupDownload();
    }

    _setupDownload() {
        if (this._supportsNativeDownload())
            this._setupNativeDownload();
        else
            this._setupFallbackDownload();
    }

    _setupNativeDownload() {
        this.$a.href = this._src;
        this.$a.download = this._filename;
    }

    _setupFallbackDownload() { // Hack to make image downloadable on iOS via long tap
        this.$a.href = 'javascript:void(0);';
    }

    _supportsNativeDownload() { // Detect if browser supports native `download` attribute
        return typeof this.$a.download !== 'undefined';
    }

    _onTouchStart() {
        this._longTouchStart = Date.now();
        this._onDownloadStart();
        if (this._supportsNativeDownload()) return;
        this._showLongTouchIndicator();
    }

    _onTouchEnd() {
        if (this._supportsNativeDownload()) return;
        this._hideLongTouchIndicator();
        if (Date.now() - this._longTouchStart > XDownloadableImage.LONG_TOUCH_DURATION) {
            this._onLongTouch();
        } else {
            this._onLongTouchCancel();
        }
    }

    _onLongTouch() {
        this._onDownloadEnd();
    }

    _onLongTouchCancel() {
        XToast.show('Touch and hold to download.');
        this._onDownloadCancel();
    }

    _onDownloadStart() {
        window.addEventListener('blur', this._onWindowBlur);
    }

    _onDownloadEnd() {
        this.fire('x-image-download');
        window.removeEventListener('blur', this._onWindowBlur);
    }

    _onDownloadCancel() {
        window.removeEventListener('blur', this._onWindowBlur);
    }

    _onWindowBlur() {
        // wait for the window to refocus when the browser download dialog closes
        this.listenOnce('focus', e => this._onDownloadEnd(), window);
    }

    _showLongTouchIndicator() {
        clearTimeout(this._indicatorHideTimeout);
        this._indicatorHideTimeout = null;
        this.$longTouchIndicator.style.display = 'block';
        this.stopAnimate('animate', this.$longTouchIndicator);
        this.$longTouchIndicator.offsetWidth; // style update
        this.$longTouchIndicator.style.opacity = 1;
        this.animate('animate', this.$longTouchIndicator);
    }

    _hideLongTouchIndicator() {
        this.$longTouchIndicator.style.opacity = 0;
        if (this._indicatorHideTimeout !== null) return;
        this._indicatorHideTimeout = setTimeout(() => this.$longTouchIndicator.style.display = 'none', 200);
    }
}
// Todo: animate file to make clickablity more obvious
// Todo: [Daniel] make our "download detecting hack" work on iOS
// Todo: [Daniel] make our "download detecting hack" work on Safari (in general: what if the file downloads immediately and no dialog opens?)