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
        this._longTouchTimeout = null;
        this._indicatorHideTimeout = null;
        this.$a = this.$('a');
        this.$img = this.$('img');
        this.$longTouchIndicator = this.$('[long-touch-indicator]');
        this._onWindowBlur = this._onWindowBlur.bind(this);
        this.$a.addEventListener('mousedown', e => this._onDownloadStart());
        this.$a.addEventListener('mouseup', e => this._onMouseUp());
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
        this._onDownloadStart();
        if (this._supportsNativeDownload()) return;
        this._showLongTouchIndicator();
        this._longTouchStart = Date.now();
        clearTimeout(this._longTouchTimeout);
        this._longTouchTimeout = setTimeout(() => this._onLongTouch(), XDownloadableImage.LONG_TOUCH_DURATION);
    }

    _onTouchEnd() {
        if (this._supportsNativeDownload()) return;
        this._hideLongTouchIndicator();
        clearTimeout(this._longTouchTimeout);
        if (Date.now() - this._longTouchStart > XDownloadableImage.LONG_TOUCH_DURATION) return;
        this._onLongTouchCancel();
    }

    _onLongTouch() {
        this._hideLongTouchIndicator();
        XToast.show('Click on "Save Image"');
        this._onDownloadEnd();
    }

    _onLongTouchCancel() {
        XToast.show('Touch and hold to download.');
        this._onDownloadCancel();
    }

    _onMouseUp() {
        if (!this._isDesktopSafari()) return;
        // desktop safari directly downloads the image without opening a dialog
        this._onDownloadEnd();
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
        this.$longTouchIndicator.style.opacity = 1;
        this.$longTouchIndicator.offsetWidth; // style update
        this.animate('animate', this.$longTouchIndicator);
    }

    _hideLongTouchIndicator() {
        this.$longTouchIndicator.style.opacity = 0;
        if (this._indicatorHideTimeout !== null) return;
        this._indicatorHideTimeout = setTimeout(() => this.$longTouchIndicator.style.display = 'none', 300);
    }

    _isDesktopSafari() {
        // see https://stackoverflow.com/a/23522755
        return /^((?!chrome|android).)*safari/i.test(navigator.userAgent) && !/mobile/i.test(navigator.userAgent);
    }
}
// Todo: animate file to make clickablity more obvious
// Todo: [Daniel] make our "download detecting hack" work on Safari and improve on iOS (in general: what if the file downloads immediately and no dialog opens?) -  we could use e.g. Service Workers as soon as they are supported by Safari
// Todo: [Daniel] download detection also not working on Chrome Android
// Todo: [low] no support for fallback download of data URl images on iOS currently. This support could be added by rendering to a canvas and retrieving an object url
