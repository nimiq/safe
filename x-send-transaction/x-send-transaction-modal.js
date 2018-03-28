import XSendTransaction from './x-send-transaction.js';
import MixinModal from '../mixin-modal/mixin-modal.js';
import NanoApi from '/libraries/nano-api/nano-api.js';
import { dashToSpace } from '/libraries/nimiq-utils/parameter-encoding/parameter-encoding.js';

export default class XSendTransactionModal extends MixinModal(XSendTransaction) {
    onCreate() {
        super.onCreate();
        this.$addressInput.placeholderColor = 'black';
    }

    allowsShow(...params) {
        params = this._parseRouterParams(params);

        return (!params.sender || NanoApi.validateAddress(dashToSpace(params.sender)))
            && (!params.recipient || NanoApi.validateAddress(dashToSpace(params.recipient)));
    }

    onShow(...params) {
        params = this._parseRouterParams(params);

        if (params.sender) {
            params.sender = dashToSpace(params.sender);
            this.sender = params.sender;
        }

        if (params.recipient) {
            params.recipient = dashToSpace(params.recipient);
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
}

// todo refactor params parsing to router