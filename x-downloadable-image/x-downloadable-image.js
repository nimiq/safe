import XElement from '/libraries/x-element/x-element.js';
import XToast from '../x-toast/x-toast.js';

export default class XDownloadableImage extends XElement {
    static get LONG_TOUCH_DURATION() {
        return 800;
    }

    static get DOWNLOAD_DURATION() {
        return 1500;
    }

    html() {
        return `
            <a>
                <img draggable="false">
                <p>&nbsp;</p>
                <button>Save</button>
            </a>
            <svg long-touch-indicator xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
                <defs>
                    <clipPath id="hexClip">
                        <path clip-rule="evenodd" d="M16 4.29h32l16 27.71l-16 27.71h-32l-16 -27.71zM20.62 12.29h22.76l11.38 19.71l-11.38 19.71h-22.76l-11.38 -19.71z"/>
                    </clipPath>
                </defs>
                <path fill-rule="evenodd" d="M16 4.29h32l16 27.71l-16 27.71h-32l-16 -27.71zM20.62 12.29h22.76l11.38 19.71l-11.38 19.71h-22.76l-11.38 -19.71z" fill="#FFFFFF" opacity="0.2"/>
                <g clip-path="url(#hexClip)">
                    <circle id="circle" cx="32" cy="32" r="16" fill="none" stroke-width="32" stroke-dasharray="100.53 100.53" transform="rotate(-120 32 32)"/>
                </g>
            </svg>
            <p></p>`;
    }

    onCreate() {
        this._src = null;
        this._filename = 'image';
        this._longTouchStart = 0;
        this._longTouchTimeout = null;
        this._indicatorHideTimeout = null;
        this._blurTimeout = null;
        this.$a = this.$('a');
        this.$img = this.$('img');
        this.$p = this.$('p');
        this.$longTouchIndicator = this.$('[long-touch-indicator]');
        this._onWindowBlur = this._onWindowBlur.bind(this);
        this.addEventListener('mousedown', e => this._onMouseDown(e)); // also gets triggered after touchstart
        this.addEventListener('touchstart', e => this._onTouchStart());
        this.addEventListener('touchend', e => this._onTouchEnd());
    }

    set src(src) {
        this._src = src;
        this.$img.src = src;
        this._setupDownload();
    }

    /** @param {string} filename */
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
        if (!this.$longTouchIndicator) return;
        this.$el.removeChild(this.$longTouchIndicator);
        this.$longTouchIndicator = null;
    }

    _setupFallbackDownload() {
        // Hack to make image downloadable on iOS via long tap.
        this.$a.href = 'javascript:void(0);';
    }

    _supportsNativeDownload() { // Detect if browser supports native `download` attribute
        return typeof this.$a.download !== 'undefined';
    }

    _onMouseDown(e) {
        if(e.button === 0) { // primary button
            if (!this._supportsNativeDownload()) return;
            this._onDownloadStart();
        }
        else if(e.button === 2) { // secondary button
            window.addEventListener('blur', this._onWindowBlur);
        }
    }

    _onTouchStart() {
        if (this._supportsNativeDownload()) return;
        // if no native download is supported, show a hint to download by long tap
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
        setTimeout(e => XToast.show('Click on "Save Image"'), 1200);
        this._onDownloadStart();
    }

    _onLongTouchCancel() {
        XToast.show('Touch and hold to download.');
    }

    _onDownloadStart() {
        // some browsers open a download dialog and blur the window focus, which we use as a hint for a download
        window.addEventListener('blur', this._onWindowBlur);
        // otherwise consider the download as successful after some time
        this._blurTimeout = setTimeout(() => this._onDownloadEnd(), XDownloadableImage.DOWNLOAD_DURATION);
    }

    _onDownloadEnd() {
        this.fire('x-image-download');
        window.removeEventListener('blur', this._onWindowBlur);
        clearTimeout(this._blurTimeout);
    }

    _onWindowBlur() {
        // wait for the window to refocus when the browser download dialog closes
        this.listenOnce('focus', e => this._onDownloadEnd(), window);
        clearTimeout(this._blurTimeout);
    }

    _showLongTouchIndicator() {
        this.$longTouchIndicator.style.display = 'block';
        this.stopAnimate('animate', this.$longTouchIndicator);
        this.animate('animate', this.$longTouchIndicator);
    }

    _hideLongTouchIndicator() {
        this.$longTouchIndicator.style.display = 'none';
    }

}