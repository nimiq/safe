import XElement from '/libraries/x-element/x-element.js';
import Iqon from '/libraries/iqons/dist/iqons.min.js';

export default class XIdenticon extends XElement {

    _onPropertiesChanged() {
        this.address = this.properties.address;
    }

    set address(address) {
        if (address) Iqon.render(address, this.$el);
    }

    set addressAsImg(address) {
        Iqon.image(address).then($img => {
            this.$el.textContent = '';
            this.$el.appendChild($img);
        });
    }
}
