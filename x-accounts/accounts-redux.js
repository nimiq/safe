import networkClient from '../../apps/safe/network-client.js';

export const TypeKeys = {
    ADD_KEY: 'accounts/add-key',
    SET_ALL_KEYS: 'accounts/set-all-keys',
    UPDATE_BALANCE: '/accounts/updateBalance',
    SET_DEFAULT: 'accounts/set-default'
};

export function reducer(state, action) {
    if (state === undefined) {
        return {
            entries: new Map(),
            loading: false,
            hasContent: false,
            error: null
        }
    }

    switch (action.type) {
        case TypeKeys.ADD_KEY:
            return {
                ...state,
                entries: new Map(state.entries)
                    .set(action.key.address, {
                        ...action.key,
                        balance: undefined
                    })
            };

        case TypeKeys.SET_ALL_KEYS:
            return {
                ...state,
                // convert array to map with address as key
                entries: new Map(action.keys.map(x => [x.address, { ...x, balance: undefined } ]))
            };

        case TypeKeys.UPDATE_BALANCE:
            const oldEntry = state.entries.get(action.address);

            return {
                ...state,
                entries: new Map(state.entries)
                    .set(action.address, {
                        ...oldEntry,
                        balance: action.balance
                    })
            };

        default:
            return state
    }
}

export function addAccount(key) {
    return async dispatch => {
        // when adding a new account, subscribe at network
        const { rpcClient } = await networkClient;
        rpcClient.subscribe(key.address);

        dispatch({
            type: TypeKeys.ADD_KEY,
            key
        });
    }
}

export function setAllKeys(keys) {
    return async dispatch => {
        // when adding a new account, subscribe at network
        const { rpcClient } = await networkClient;
        rpcClient.subscribe(keys.map(key => key.address));

        dispatch({
            type: TypeKeys.SET_ALL_KEYS,
            keys
        });
    }
}

export function updateBalance(address, balance) {
    return {
        type: TypeKeys.UPDATE_BALANCE,
        address,
        balance
    }
}
