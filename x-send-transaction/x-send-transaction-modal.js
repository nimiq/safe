import XSendTransaction from './x-send-transaction.js';
import MixinModal from '../mixin-modal/mixin-modal.js';
import MixinRedux from '../mixin-redux/mixin-redux.js';

export default class XSendTransactionModal extends MixinModal(XSendTransaction) {
    onCreate() {
        super.onCreate();
        this.$addressInput.placeholderColor = 'black';
    }

    onEntry(...params) {
        params = this._parseRouterParams(params);

        if (params.sender) {
            params.sender = this._dashToSpace(params.sender);
            let account = MixinRedux.store.getState().accounts.entries.get(params.sender);
            if (!account) account = { address: params.sender };
            this.sender = account;
        }

        if (params.recipient) {
            params.recipient = this._dashToSpace(params.recipient);
            this.recipient = params.recipient;
        }
        super.onEntry();
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
