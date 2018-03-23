import XElement from '/libraries/x-element/x-element.js';
import Iqons from '/libraries/iqons/dist/iqons.min.js';
import NanoApi from '/libraries/nano-api/nano-api.js';

export default class XIdenticon extends XElement {

    html() {
        return '<img width="100%" height="100%;">';
    }

    onCreate() {
        this.$img = this.$('img');
        this.address = null;
    }

    _onPropertiesChanged() {
        this.address = this.properties.address;
    }

    set address(address) {
        if (NanoApi.validateAddress(address)) {
            Iqons.toDataUrl(address).then(dataUrl => this.$img.src = dataUrl);
        } else {
            this.$img.src = Iqons.placeholderToDataUrl();
        }
    }

    set addressAsSvg(address) {
        // also clears the inner html of this tag
        if (NanoApi.validateAddress(address)) {
            Iqons.render(address, this.$el);
        } else {
            Iqons.renderPlaceholder(this.$el);
        }
    }
}
