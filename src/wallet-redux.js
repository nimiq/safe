export const TypeKeys = {
    LOGIN: 'wallet/login',
    SET_ALL_KEYS: 'wallet/set-all-keys',
    UPDATE_LABEL: 'wallet/update-label',
    UPDATE_NUMBER_ACCOUNTS: 'accounts/update-number-accounts',
    LOGOUT: 'wallet/logout',
};

export const LEGACY = 'LEGACY';

export const WalletType = {
    LEGACY: 0,
    BIP39: 1,
    LEDGER: 2,
};

export const initialState = {
    entries: new Map(),
    loading: false,
    hasContent: false,
    activeKeyId: LEGACY,
};

export function reducer(state, action) {
    if (state === undefined) {
        return initialState;
    }

    switch (action.type) {
        case TypeKeys.LOGIN:
            return Object.assign({}, state, {
                hasContent: true,
                entries: new Map(state.entries)
                    .set(action.key.id, Object.assign({}, action.key))
            });

        case TypeKeys.SET_ALL_KEYS:
            const newEntries = action.keys.map(x => {
                const oldEntry = state.entries.get(x.id);

                return [
                    x.id,
                    Object.assign({}, oldEntry, x)
                ];
            });

            return Object.assign({}, state, {
                hasContent: true,
                // converts array to map with id as key
                entries: new Map(newEntries)
            });

        case TypeKeys.UPDATE_LABEL: {
            const entries = new Map(state.entries);
            entries.set(action.keyId, Object.assign({}, state.entries.get(action.keyId), { label: action.label }));

            return Object.assign({}, state, {
                entries
            });
        }

        case TypeKeys.UPDATE_NUMBER_ACCOUNTS: {
            const entries = new Map(state.entries);
            entries.set(action.keyId, Object.assign({}, state.entries.get(action.keyId), { numberAccounts: action.numberAccounts }));

            return Object.assign({}, state, {
                entries
            });
        }

        case TypeKeys.LOGOUT: {
            const entries = new Map(state.entries);
            const activeKeyId = state.activeKeyId;
            entries.delete(action.keyId);

            // TODO Remove accounts of logged out key

            if (state.activeKeyId === action.keyId) {
                // If we logout of the current active key, log into the first available key
                activeKeyId = entries.size > 0 ? entries.keys().next().value : null;
            }

            return Object.assign({}, state, {
                entries,
                activeKeyId
            });
        }

        default:
            return state
    }
}

export function setAllKeys(keys) {
    return {
        type: TypeKeys.SET_ALL_KEYS,
        keys
    };
}

export function login(key) {
    return {
        type: TypeKeys.LOGIN,
        key
    }
}

export function logout(keyId) {
    return {
        type: TypeKeys.LOGIN,
        keyId
    }
}

export function updateLabel(keyId, label) {
    return {
        type: TypeKeys.LOGIN,
        keyId,
        label
    }
}

export function updateNumberAccounts(keyId, numberAccounts) {
    return {
        type: TypeKeys.LOGIN,
        keyId,
        numberAccounts
    }
}
