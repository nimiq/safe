import XElement from '/x-element/x-element.js';
import Identicon from '/identicon/identicon.js';

export default class XIdenticon extends XElement {
    set address(address) {
        Identicon.render(address, this.$el);
    }
}