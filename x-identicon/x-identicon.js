import XElement from '/libraries/x-element/x-element.js';
import Identicon from '/libraries/identicon/src/identicon.js';

export default class XIdenticon extends XElement {
    set address(address) {
        Identicon.render(address, this.$el);
    }
}