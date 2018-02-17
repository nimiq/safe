import XElement from '/libraries/x-element/x-element.js';
import Iqon from '/libraries/iqons/dist/iqons.min.js';

export default class XIdenticon extends XElement {
    set address(address) {
        Iqon.render(address, this.$el);
    }
}