// todo, to be discussed: abstract the functionality we need here in a generic network store OR consider network-client
// as generic solution, so network-client should move to libraries?
import networkClient from '/apps/safe/network-client.js';

export const TypeKeys = {
    ADD_KEY: 'accounts/add-key',
    SET_ALL_KEYS: 'accounts/set-all-keys',
    UPDATE_BALANCES: '/accounts/updateBalances',
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
                hasContent: true,
                entries: new Map(state.entries)
                    .set(action.key.address, {
                        ...action.key,
                        balance: undefined
                    })
            };

        case TypeKeys.SET_ALL_KEYS:
            return {
                ...state,
                hasContent: true,
                // convert array to map with address as key
                entries: new Map(action.keys.map(x => [x.address, { ...x, balance: undefined } ]))
            };

        case TypeKeys.UPDATE_BALANCES:
            const entries = new Map(state.entries);
            for (const [address, balance] of action.balances) {
                entries.set(address, {...entries.get(address), balance});
            }

            return {
                ...state,
                entries
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

export function updateBalances(balances) {
    return {
        type: TypeKeys.UPDATE_BALANCES,
        balances
    }
}
