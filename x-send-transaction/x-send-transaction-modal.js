import XSendTransaction from './x-send-transaction.js';
import MixinModal from '../mixin-modal/mixin-modal.js';
import ValidationUtils from '/libraries/secure-utils/validation-utils/validation-utils.js';
import { dashToSpace } from '/libraries/nimiq-utils/parameter-encoding/parameter-encoding.js';

export default class XSendTransactionModal extends MixinModal(XSendTransaction) {
    allowsShow(...params) {
        params = this._parseRouterParams(params);

        return (!params.sender || ValidationUtils.isValidAddress(dashToSpace(params.sender)))
            && (!params.recipient || ValidationUtils.isValidAddress(dashToSpace(params.recipient)));
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
