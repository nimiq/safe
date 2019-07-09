import XElement from '../../lib/x-element/x-element.js';
import Iqons from '../../../node_modules/@nimiq/iqons/dist/iqons.min.js';
import { ValidationUtils } from '../../../node_modules/@nimiq/utils/dist/module/ValidationUtils.js';

export default class XIdenticon extends XElement {

    html() {
        return '<img width="100%" height="100%" style="display: block;">';
    }

    onCreate() {
        this.$img = this.$('img');
        this.placeholderColor = '#bbb';
    }

    _onPropertiesChanged() {
        this.address = this.properties.address;
    }

    set placeholderColor(color) {
        this._placeholderColor = color;
        this.address = this._address; // rerender
    }

    set address(address) {
        this._address = address;

        if (address === 'cashlink') {
            this.$img.src = 'data:image/svg+xml,<svg width="48" height="44" viewBox="0 0 48 44" fill="currentColor" opacity="0.4" xmlns="http://www.w3.org/2000/svg"><path d="M30.7 43.28h-6.56a.66.66 0 0 1-.66-.66c0-.36.3-.66.66-.66h6.55c.36 0 .66.3.66.66 0 .36-.29.66-.66.66zm-13.12 0h-3.15a4.58 4.58 0 0 1-3.5-1.61.66.66 0 1 1 1-.85 3.3 3.3 0 0 0 2.5 1.14h3.15a.66.66 0 1 1 0 1.31zm19.34-1.2a.66.66 0 0 1-.46-.19.65.65 0 0 1-.01-.92c.18-.2.35-.4.48-.64l2.8-4.84a.66.66 0 0 1 .89-.25c.31.19.42.59.24.9L38.06 41c-.18.33-.4.63-.67.89-.13.13-.3.2-.47.2zM8.1 36.25a.66.66 0 0 1-.57-.32l-3.28-5.68a.66.66 0 1 1 1.14-.66l3.28 5.68a.66.66 0 0 1-.57.98zm35.47-5.47a.66.66 0 0 1-.33-.08.66.66 0 0 1-.24-.9l3.28-5.68a.66.66 0 0 1 .9-.24c.31.18.42.58.24.9l-3.28 5.68a.66.66 0 0 1-.57.32zM1.55 24.9a.66.66 0 0 1-.57-.33l-.36-.63a4.56 4.56 0 0 1 0-4.59l.85-1.48a.66.66 0 0 1 .9-.24c.31.18.42.58.24.9l-.85 1.47a3.25 3.25 0 0 0 0 3.29l.36.63a.66.66 0 0 1-.57.98zm45.8-4.56a.66.66 0 0 1-.58-.33l-3.28-5.68a.66.66 0 1 1 1.14-.66l3.28 5.68a.66.66 0 0 1-.57.99zM5.3 13.17a.66.66 0 0 1-.33-.09.66.66 0 0 1-.24-.9L8.02 6.5a.66.66 0 0 1 .9-.24c.31.19.42.59.24.9l-3.28 5.68a.65.65 0 0 1-.57.33zm35.48-4.2a.66.66 0 0 1-.57-.33l-3.28-5.68a.66.66 0 1 1 1.14-.65l3.28 5.68c.18.31.07.71-.24.9a.74.74 0 0 1-.33.08zM12.16 2.04c-.2 0-.41-.1-.54-.28a.65.65 0 0 1 .16-.9C12.56.3 13.48 0 14.43 0h4.13a.66.66 0 1 1 0 1.31h-4.13c-.69 0-1.34.21-1.9.6a.61.61 0 0 1-.37.13zm19.52-.73h-6.56a.66.66 0 0 1-.66-.65c0-.36.3-.66.66-.66h6.56a.66.66 0 1 1 0 1.31z"/></svg>';
            return;
        }

        if (ValidationUtils.isValidAddress(address)) {
            Iqons.toDataUrl(address.toUpperCase()).then(dataUrl => this.$img.src = dataUrl);
        } else {
            this.$img.src = Iqons.placeholderToDataUrl(this._placeholderColor, Infinity);
        }
    }

    get address() {
        return this._address;
    }

    set addressAsSvg(address) {
        // also clears the inner html of this tag
        if (ValidationUtils.isValidAddress(address)) {
            Iqons.render(address, this.$el);
        } else {
            Iqons.renderPlaceholder(this.$el, this._placeholderColor, Infinity);
        }
    }
}
