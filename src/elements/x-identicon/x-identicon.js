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

        if (address === 'Cashlink') {
            // Render a special cashlink logo
            this.$img.src = 'data:image/svg+xml,<svg width="50" height="46" viewBox="0 0 50 46" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M48.95 20.93L38.79 3.04A4.05 4.05 0 0 0 35.26.98H14.94c-1.45 0-2.8.79-3.52 2.06L1.25 20.94a4.2 4.2 0 0 0 0 4.12l10.17 17.9a4.05 4.05 0 0 0 3.52 2.06h20.32c1.45 0 2.8-.8 3.52-2.07l10.16-17.89a4.17 4.17 0 0 0 .01-4.13z" fill="url(%23paint0_radial)"/><path d="M25.91 29.75l-1.81 3.07a2.44 2.44 0 0 1-3.42.93l-1-.59a2.52 2.52 0 0 1-.92-3.47l3.72-6.54c.7-1.24 2.29-1.67 3.42-.93l1 .58c.44.26.97.12 1.23-.33a.9.9 0 0 0-.33-1.25l-.91-.6a4.29 4.29 0 0 0-5.96 1.61l-3.72 6.55a4.43 4.43 0 0 0 1.6 6.05l1 .59a4.29 4.29 0 0 0 5.95-1.62l1.73-3.05a.9.9 0 0 0-.32-1.25c-.47-.35-1-.2-1.26.25z" fill="white"/><path d="M32.76 12.62l-1-.59a4.29 4.29 0 0 0-5.96 1.63l-1.86 3.27a.9.9 0 0 0 .33 1.25c.45.26.97.11 1.23-.34l1.86-3.27c.7-1.24 2.28-1.67 3.42-.93l1 .58a2.52 2.52 0 0 1 .91 3.48l-3.72 6.54c-.32.57-.86 1-1.56 1.2-.62.16-1.3.06-1.94-.24a.87.87 0 0 0-1.23.33.9.9 0 0 0 .33 1.25 4.33 4.33 0 0 0 5.96-1.62l3.72-6.55a4.4 4.4 0 0 0-1.49-5.99c-.09.03-.09.03 0 0z" fill="white"/><defs><radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(-48.7834 0 0 -44.0431 49.5 45.02)"><stop stop-color="%23260133"/><stop offset="1" stop-color="%231F2348"/></radialGradient></defs></svg>';
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
