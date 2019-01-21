import UTF8Tools from '/libraries/secure-utils/utf8-tools/utf8-tools.js';

const TransactionTags = {
    SendCashlink: new Uint8Array([0, 130, 128, 146, 135]),
    ReceiveCashlink: new Uint8Array([0, 139, 136, 141, 138]),
};

function _arrayEquals(a, b) {
    if ((a.byteLength || a.length) !== (b.byteLength || b.length)) return false;
    const viewA = _toUint8View(a);
    const viewB = _toUint8View(b);
    for (let i = 0; i < viewA.length; i++) {
        if (viewA[i] !== viewB[i]) return false;
    }
    return true;
}

function _toUint8View(arrayLike) {
    if (arrayLike instanceof Uint8Array) {
        return arrayLike;
    } if (arrayLike instanceof ArrayBuffer) {
        return new Uint8Array(arrayLike);
    } else if (arrayLike.buffer instanceof ArrayBuffer) {
        return new Uint8Array(arrayLike.buffer);
    } else {
        return Uint8Array.from(arrayLike);
    }
}

export default function convertExtradata(extraData) {
    if (_arrayEquals(extraData, TransactionTags.SendCashlink)) {
        return 'Charging cashlink';
    } else if (_arrayEquals(extraData, TransactionTags.ReceiveCashlink)) {
        return 'Redeeming cashlink';
    } else {
        return UTF8Tools.utf8ByteArrayToString(extraData);
    }
}
