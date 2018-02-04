import XElement from "/library/x-element/x-element.js";
import ActivationApi from "/library/activation-api/activation-api.js";

export default class XActivationApi extends XElement {
    onCreate() {
        this._api = new ActivationApiWrapper(this);
    }
}

class ActivationApiWrapper extends ActivationApi {
    constructor(element) {
        super();
        this._element = element;
    }

    onInitialized() {
        this._element.fire('x-api-ready', this);
    }
}