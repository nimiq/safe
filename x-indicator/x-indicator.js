import XElement from '/library/x-element/x-element.js';

export default class XIndicator extends XElement {

    styles() { return ['x-indicator']; }

    _prepareIndicators() {
        const $indicator = this.$('x-indicator');
        for (let i = 0; i < this.$slides.length; i++) {
            $indicator.appendChild(document.createElement('x-dot'));
        }
        this.$indicators = $indicator.childNodes;
    }
}