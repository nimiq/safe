export const TypeKeys = {
    SET_CONSENSUS: 'network/set-consensus',
    SET_HEIGHT: 'network/set-height',
    SET_PEER_COUNT: 'network/set-peer-count',
    SET_GLOBAL_HASHRATE: 'network/set-global-hashrate'
};

export function reducer(state, action) {
    if (state === undefined) {
        return {
            consensus: 'initializing',
            height: 0,
            peerCount: 0,
            globalHashrate: 0
        }
    }

    switch (action.type) {
        case TypeKeys.SET_CONSENSUS:
            return {
                ...state,
                consensus: action.consensus
            }

        case TypeKeys.SET_HEIGHT:
            return {
                ...state,
                height: action.height
            }

        case TypeKeys.SET_PEER_COUNT:
            return {
                ...state,
                peerCount: action.peerCount
            }

        case TypeKeys.SET_GLOBAL_HASHRATE:
            return {
                ...state,
                globalHashrate: action.globalHashrate
            }

        default:
            return state
    }
}

export function setConsensus(consensus) {
    return {
        type: TypeKeys.SET_CONSENSUS,
        consensus
    }
}

export function setHeight(height) {
    return {
        type: TypeKeys.SET_HEIGHT,
        height
    }
}

export function setPeerCount(peerCount) {
    return {
        type: TypeKeys.SET_PEER_COUNT,
        peerCount
    }
}

export function setGlobalHashrate(globalHashrate) {
    return {
        type: TypeKeys.SET_GLOBAL_HASHRATE,
        globalHashrate
    }
}
