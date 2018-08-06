import UTF8Tools from '/libraries/secure-utils/utf8-tools/utf8-tools.js';
import BufferUtils from '/libraries/nimiq-utils/buffer-utils/buffer-utils.js';

const TransactionTags = {
    SendCashlink: new Uint8Array([0, 130, 128, 146, 135]),
    ReceiveCashlink: new Uint8Array([0, 139, 136, 141, 138]),
};

export default function convertExtradata(extraData) {
    if (BufferUtils.equals(extraData, TransactionTags.SendCashlink)) {
        return 'Charging cashlink';
    } else if (BufferUtils.equals(extraData, TransactionTags.ReceiveCashlink)) {
        return 'Redeeming cashlink';
    } else {
        return UTF8Tools.utf8ByteArrayToString(extraData);
    }
}
