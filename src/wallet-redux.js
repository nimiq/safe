import { TypeKeys as AccountTypeKeys } from '/elements/x-accounts/accounts-redux.js';
import { legacyAccounts$ } from './selectors/account$.js';
import { walletsArray$ } from './selectors/wallet$.js';

export const TypeKeys = {
    LOGIN: 'wallet/login',
    SWITCH: 'wallet/switch',
    SET_ALL: 'wallet/set-all',
    UPDATE_LABEL: 'wallet/update-label',
    LOGOUT: 'wallet/logout',
    SET_DEFAULT: 'wallet/set-default',
    SET_FILE_FLAG: 'wallet/set-file-flag',
    SET_WORDS_FLAG: 'wallet/set-words-flag',
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
                    .set(action.wallet.id, Object.assign({}, action.wallet)),
                activeWalletId: action.wallet.id,
            });

        case TypeKeys.SWITCH:
            return Object.assign({}, state, {
                activeWalletId: action.walletId,
            });

        case TypeKeys.SET_ALL:
            if (action.wallets.length === 0) return state;

            const newEntries = action.wallets.map(x => {
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

            const activeWalletIsEmptyLegacy = state.activeWalletId === LEGACY && !action.hasLegacyAccounts;
            const activeWalletWasDeleted = state.activeWalletId !== LEGACY && !newState.entries.get(state.activeWalletId);

            if (activeWalletIsEmptyLegacy || activeWalletWasDeleted) {
                newState.activeWalletId = action.walletWithMostAccounts.id;
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

            if (activeWalletId === action.walletId) {
                // If we logout of the current active key, log into the first available key
                activeWalletId = entries.size > 0 ? entries.keys().next().value : null;
            }

            return Object.assign({}, state, {
                entries,
                activeWalletId
            });
        }

        case AccountTypeKeys.LOGOUT_LEGACY: {
            if (!action.isLastLegacy) return state;

            // Last legacy account was logged out, so choose some other active wallet
            return Object.assign({}, state, {
                activeWalletId: state.entries.size > 0 ? state.entries.keys().next().value : null,
            });
        }

        case TypeKeys.SET_FILE_FLAG:
            return Object.assign({}, state, {
                entries: new Map(state.entries).set(
                    action.id,
                    Object.assign({}, state.entries.get(action.id), { fileExported: action.value }),
                ),
            });

        case TypeKeys.SET_WORDS_FLAG:
            return Object.assign({}, state, {
                entries: new Map(state.entries).set(
                    action.id,
                    Object.assign({}, state.entries.get(action.id), { wordsExported: action.value }),
                ),
            });

        default:
            return state
    }
}

export function setAllWallets(wallets) {
    return async (dispatch, getState) => {
        const state = getState();
        const hasLegacyAccounts = legacyAccounts$(state).length > 0;
        const walletWithMostAccounts = walletsArray$(state).sort(
            (a, b) => a.accounts.size > b.accounts.size
                ? -1
                : a.accounts.size < b.accounts.size
                    ? 1
                    : 0
        )[0];

        return dispatch({
            type: TypeKeys.SET_ALL,
            wallets,
            hasLegacyAccounts,
            walletWithMostAccounts,
        });
    }
}

export function login(wallet) {
    return {
        type: TypeKeys.LOGIN,
        wallet
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
            addresses: addressesToRemove,
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

export function setFileFlag(id, value) {
    return {
        type: TypeKeys.SET_FILE_FLAG,
        id,
        value
    };
}

export function setWordsFlag(id, value) {
    return {
        type: TypeKeys.SET_WORDS_FLAG,
        id,
        value
    };
}

// todo move populateWallets() here
