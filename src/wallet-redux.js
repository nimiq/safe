export const TypeKeys = {
    LOGIN: 'wallet/login',
    SWITCH: 'wallet/switch',
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
                    .set(action.key.id, Object.assign({}, action.key)),
                activeKeyId: action.key.type === WalletType.LEGACY ? LEGACY : action.key.id,
            });

        case TypeKeys.SWITCH:
            return Object.assign({}, state, {
                activeKeyId: action.keyId,
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
            let activeKeyId = state.activeKeyId;
            entries.delete(action.keyId);

            if (activeKeyId === action.keyId) { // TODO: Handle when removed wallet was the last legacy wallet
                // If we logout of the current active key, log into the first available key
                activeKeyId = entries.size > 0 ? entries.keys().next().value : null;
                // TODO: Handle when first found keyId belongs to a legacy key
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

export function switchWallet(keyId) {
    return {
        type: TypeKeys.SWITCH,
        keyId
    }
}

export function logout(keyId) {
    return async (dispatch, getState) => {
        // TODO Generate list of addresses affected by logout,
        // to enable transaction-redux to remove affected transactions
        const state = getState();
        const addressesToRemove = [];

        let iterator;
        const accountIterator = state.accounts.entries.values();
        while ((iterator = accountIterator.next()) && !iterator.done) {
            const account = iterator.value;
            if (account.keyId === keyId) {
                addressesToRemove.push(account.address);
            }
        }

        dispatch({
            type: TypeKeys.LOGOUT,
            keyId,
            addresses: addressesToRemove
        });
    }
}

export function updateLabel(keyId, label) {
    return {
        type: TypeKeys.UPDATE_LABEL,
        keyId,
        label
    }
}

export function updateNumberAccounts(keyId, numberAccounts) {
    return {
        type: TypeKeys.UPDATE_NUMBER_ACCOUNTS,
        keyId,
        numberAccounts
    }
}
