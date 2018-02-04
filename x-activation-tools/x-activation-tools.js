import XElement from "/library/x-element/x-element.js";
import ActivationTools from "/library/nimiq-utils/activation-tools/activation-tools.js";

export default class XActivationTools extends XElement {
    onCreate() {
        this._api = new ActivationToolsWrapper(this);
    }
}

class ActivationToolsWrapper extends ActivationTools {
    constructor(element) {
        super();
        this._element = element;
    }

    onInitialized() {
        this._element.fire('x-api-ready', this);
    }
}