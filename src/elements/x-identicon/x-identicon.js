import XElement from '../../lib/x-element/x-element.js';
import Iqons from '../../../node_modules/@nimiq/iqons/dist/iqons.min.js';
import { ValidationUtils } from '../../../node_modules/@nimiq/utils/dist/module/ValidationUtils.js';

export default class XIdenticon extends XElement {

    html() {
        return '<img width="100%" height="100%">';
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

        if (ValidationUtils.isValidAddress(address)) {
            Iqons.toDataUrl(address.toUpperCase()).then(dataUrl => this.$img.src = dataUrl);
        } else {
            this.$img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" height="44" width="49" viewBox="0 0 49 44" ><path d="M47.8 20L37.89 2.66a3.97 4 0 0 0-3.45-2H14.57a3.97 4 0 0 0-3.44 2L1.2 20a3.97 4 0 0 0 0 4l9.93 17.34a3.97 4 0 0 0 3.44 2h19.86a3.97 4 0 0 0 3.44-2L47.8 24a3.97 4 0 0 0 0-4z" fill="none" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-dasharray="6.18415886,7.00871338" stroke-dashoffset="-1" stroke-opacity=".4"/></svg>';
        }
    }

    get address() {
        return this._address;
    }

    set isCashlink(value) {
        this.$el.classList.toggle('cashlink', value);
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
