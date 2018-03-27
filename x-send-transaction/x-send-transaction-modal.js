import XSendTransaction from './x-send-transaction.js';
import MixinModal from '../mixin-modal/mixin-modal.js';
import NanoApi from '/libraries/nano-api/nano-api.js';

export default class XSendTransactionModal extends MixinModal(XSendTransaction) {
    onCreate() {
        super.onCreate();
        this.$addressInput.placeholderColor = 'black';
    }

    allowsShow(...params) {
        params = this._parseRouterParams(params);

        return (!params.sender || NanoApi.validateAddress(this._dashToSpace(params.sender)))
            && (!params.recipient || NanoApi.validateAddress(this._dashToSpace(params.recipient)));
    }

    onShow(...params) {
        params = this._parseRouterParams(params);

        if (params.sender) {
            params.sender = this._dashToSpace(params.sender);
            this.sender = params.sender;
        }

        if (params.recipient) {
            params.recipient = this._dashToSpace(params.recipient);
            this.recipient = params.recipient;
        }
    }

    _parseRouterParams(params) {
        return params.reduce((result, param) => {
            const [key, value] = param.split('=');
            result[key] = value;
            return result;
        }, {});
    }

    _dashToSpace(string) {
        if (typeof string !== 'string') return null;
        return string.replace(/-/gi, ' ');
    }
}
