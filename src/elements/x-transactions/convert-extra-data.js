import { Utf8Tools } from '../../../node_modules/@nimiq/utils/dist/module/Utf8Tools.js';

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

export function isFundingCashlink(extraData) {
    return _arrayEquals(extraData, TransactionTags.SendCashlink);
}

export function isClaimingCashlink(extraData) {
    return _arrayEquals(extraData, TransactionTags.ReceiveCashlink);
}

export function isCashlink(extraData) {
    return isFundingCashlink(extraData) || isClaimingCashlink(extraData);
}

export function convertExtradata(extraData) {
    console.log(extraData);
    if (isFundingCashlink(extraData)) return 'Funding cashlink';
    else if (isClaimingCashlink(extraData)) return 'Claiming cashlink';
    else return Utf8Tools.utf8ByteArrayToString(extraData);
}
