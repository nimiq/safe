import XElement from '/library/x-element/x-element.js';
import XPages from '../x-pages/x-pages.js';
import XToast from '../x-toast/x-toast.js';
import XAddressIntroPage from './x-address-intro-page.js';
import XAddressScannerPage from './x-address-scanner-page.js';
import XAddressFallbackPage from './x-address-fallback-page.js';

export default class XAddressPages extends XElement {
    html() {
        return `
            <x-pages selected="scanner" animation-show="from-right-in" animation-hide="from-left-out">
                <x-address-intro-page page="intro"></x-address-intro-page>
                <x-address-scanner-page page="scanner"></x-address-scanner-page>
                <x-address-fallback-page page="fallback"></x-address-fallback-page>
            </x-pages>`;
    }

    children() {
        return [XPages, XAddressIntroPage, XAddressScannerPage, XAddressFallbackPage, XToast];
    }

    onCreate() {
        this.addEventListener('x-address-page-select', e => this._onPageSelect(e));

        this.addEventListener('x-address-scanner-success', e => this._onCameraSuccess());
        this.addEventListener('x-address-scanner-error', e => this._onCameraError());

        this.addEventListener('x-address-input', e => this._onAddressInput(e));
        this.addEventListener('x-address-file-input', e => this._onAddressInput(e));
        this.addEventListener('x-address-scan', e => this._onAddressInput(e));
        requestAnimationFrame(e => this._checkCameraStatus());
    }

    _onAddressInput(e) {
        e.stopPropagation();
        const address = e.detail;
        this.fire('x-recipient', address);
    }

    set active(active) {
        this.$addressScannerPage.active = active && ScannerSettingsStorage.useScanner;
    }

    _checkCameraStatus() {
        const isFirstUse = ScannerSettingsStorage.isFirstUse;
        if (isFirstUse) return this._select('intro');
        const useScanner = ScannerSettingsStorage.useScanner;
        if (useScanner)
            this._select('scanner');
        else
            this._select('fallback');
    }

    _select(page) {
        this.fire('x-address-page-select', page);
    }


    _onPageSelect(event) {
        const page = event.detail;
        if (page === 'scanner') return this.$addressScannerPage.startScanner();
        this.$pages.select(page);
    }


    _onCameraSuccess() {
        this.$pages.select('scanner');
        ScannerSettingsStorage.useScanner = true;
    }

    _onCameraError() {
        this.$pages.select('fallback');
        ScannerSettingsStorage.useScanner = false;
        this.$toast.show('Failed to start scanner. Make sure nimiq.com is allowed to access your camera.');
    }
}

class ScannerSettingsStorage {

    static get KEY_USE_CAMERA() { return 'x-scanner-use-camera' }

    static get isFirstUse() {
        const value = localStorage[this.KEY_USE_CAMERA];
        return value === undefined || value === null;
    }

    static set useScanner(useScanner) {
        const value = useScanner ? 'yes' : 'no'; // Hack: localstorage can't store booleans
        localStorage[this.KEY_USE_CAMERA] = value;
    }

    static get useScanner() {
        return localStorage[this.KEY_USE_CAMERA] === 'yes';
    }
}