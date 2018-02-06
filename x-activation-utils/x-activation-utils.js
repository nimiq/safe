import XElement from "/library/x-element/x-element.js";
import ActivationUtils from "/library/nimiq-utils/activation-utils/activation-utils.js";

export default class XActivationUtils extends XElement {
    onCreate() {
        this._api = new ActivationToolsWrapper(this);
    }
}

class ActivationToolsWrapper extends ActivationUtils {
    constructor(element) {
        super();
        this._element = element;
    }

    onDashboardDataResult(response) {
        this._element.fire('x-activation-dashboard-data', response);
    }

    onIsValidToken(response) {
        this._element.fire('x-activation-valid-token', response);
    }

    onWalletCreated(response) {
        this._element.fire('x-activation-wallet-created', response);
    }
    
    onActivateAddress(response) {
        this._element.fire('x-activation-activate-address', response);
    }
}