import XElement from '/library/x-element/x-element.js';
import Identicon from '/library/identicon/src/identicon.js';

export default class XIdenticon extends XElement {
    set address(address) {
        Identicon.render(address, this.$el);
    }
}