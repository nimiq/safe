import XElement from '/libraries/x-element/x-element.js';
import Iqon from '/libraries/iqons/dist/iqons.min.js';

export default class XIdenticon extends XElement {
    set address(address) {
        Iqon.render(address, this.$el);
    }

    set addressAsImg(address) {
        Iqon.image(address).then($img => {
            this.$el.textContent = '';
            this.$el.appendChild($img);
        });
    }
}