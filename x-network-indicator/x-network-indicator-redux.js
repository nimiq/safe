// todo, to be discussed: abstract the functionality we need here in a generic network store OR consider network-client
// as generic solution, so network-client should move to libraries?
import networkClient from '../../apps/safe/network-client.js';

export const TypeKeys = {
    SET_CONSENSUS: 'network/set-consensus',
    SET_HEIGHT: 'network/set-height',
    SET_PEER_COUNT: 'network/set-peer-count'
};

export function reducer(state, action) {
    if (state === undefined) {
        return {
            consensus: 'lost',
            height: 0,
            peerCount: 0
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
