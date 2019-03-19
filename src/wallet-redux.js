export const TypeKeys = {
    LOGIN: 'wallet/login',
    SWITCH: 'wallet/switch',
    SET_ALL_KEYS: 'wallet/set-all-keys',
    UPDATE_LABEL: 'wallet/update-label',
    LOGOUT: 'wallet/logout',
    SET_DEFAULT: 'wallet/set-default',
};

export const LEGACY = 'LEGACY';

export const WalletType = {
    LEGACY: 1,
    BIP39: 2,
    LEDGER: 3,
};

export const initialState = {
    entries: new Map(),
    loading: false,
    hasContent: false,
    activeWalletId: LEGACY,
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
                activeWalletId: action.key.type === WalletType.LEGACY ? LEGACY : action.key.id,
            });

        case TypeKeys.SWITCH:
            return Object.assign({}, state, {
                activeWalletId: action.walletId,
            });

        case TypeKeys.SET_ALL_KEYS:
            if (action.keys.length === 0) return state;

            const newEntries = action.keys.map(x => {
                const oldEntry = state.entries.get(x.id);

                return [
                    x.id,
                    Object.assign({}, oldEntry, x)
                ];
            });

            const newState = Object.assign({}, state, {
                hasContent: true,
                // converts array to map with id as key
                entries: new Map(newEntries)
            });

            if (state.activeWalletId !== LEGACY && !newState.entries.get(state.activeWalletId)) {
                newState.activeWalletId = [ ...newState.entries.values() ][0].id;
            }

            return newState;

        case TypeKeys.UPDATE_LABEL: {
            const entries = new Map(state.entries);
            entries.set(action.walletId, Object.assign({}, state.entries.get(action.walletId), { label: action.label }));

            return Object.assign({}, state, {
                entries
            });
        }

        case TypeKeys.SET_DEFAULT:
            return Object.assign({}, state, {
                activeWalletId: action.id
            });

        case TypeKeys.LOGOUT: {
            const entries = new Map(state.entries);
            let activeWalletId = state.activeWalletId;
            entries.delete(action.walletId);

            if (activeWalletId === action.walletId) { // TODO: Handle when removed wallet was the last legacy wallet
                // If we logout of the current active key, log into the first available key
                activeWalletId = entries.size > 0 ? entries.keys().next().value : null;
                // TODO: Handle when first found walletId belongs to a legacy key
            }

            return Object.assign({}, state, {
                entries,
                activeWalletId
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

export function switchWallet(walletId) {
    return {
        type: TypeKeys.SWITCH,
        walletId
    }
}

export function logout(walletId) {
    return async (dispatch, getState) => {
        const state = getState();
        const addressesToRemove = [];

        let iterator;
        const accountIterator = state.accounts.entries.values();
        while ((iterator = accountIterator.next()) && !iterator.done) {
            const account = iterator.value;
            if (account.walletId === walletId) {
                addressesToRemove.push(account.address);
            }
        }

        dispatch({
            type: TypeKeys.LOGOUT,
            walletId,
            addresses: addressesToRemove
        });
    }
}

export function updateLabel(walletId, label) {
    return {
        type: TypeKeys.UPDATE_LABEL,
        walletId,
        label
    }
}

export function setDefaultWallet(id) {
    return {
        type: TypeKeys.SET_DEFAULT,
        id
    };
}
