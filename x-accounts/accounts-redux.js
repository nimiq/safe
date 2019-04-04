// todo, to be discussed: abstract the functionality we need here in a generic network store OR consider network-client
// as generic solution, so network-client should move to libraries? - We could also move the async functions to
// account-manager.js

import networkClient from '/apps/safe/src/network-client.js';
import Config from '/libraries/secure-utils/config/config.js';
import { TypeKeys as WalletTypeKeys, WalletType } from '/apps/safe/src/wallet-redux.js';
import { legacyAccounts$ } from '/apps/safe/src/selectors/account$.js';

export const TypeKeys = {
    ADD: 'accounts/add',
    SET_ALL: 'accounts/set-all',
    UPDATE_BALANCES: 'accounts/update-balances',
    UPDATE_LABEL: 'accounts/update-label',
    REMOVE: 'accounts/remove',
    LOGOUT_LEGACY: 'accounts/logout-legacy',
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
        case TypeKeys.ADD:
            const oldEntry = state.entries.get(action.account.address);

            return Object.assign({}, state, {
                hasContent: true,
                entries: new Map(state.entries)
                    .set(action.account.address, Object.assign({}, action.account, {
                        balance: oldEntry ? oldEntry.balance : undefined
                    }))
            });

        case TypeKeys.SET_ALL:
            const newEntries = action.accounts.map(x => {
                const oldEntry = state.entries.get(x.address);

                return [
                    x.address,
                    Object.assign({}, oldEntry, x)
                ];
            });

            return Object.assign({}, state, {
                hasContent: true,
                // convert array to map with address as key
                entries: new Map(newEntries)
            });

        case TypeKeys.UPDATE_BALANCES: {
            const entries = new Map(state.entries);
            for (const [address, balance] of action.balances) {
                entries.set(address, Object.assign({}, entries.get(address), { balance }));
            }

            return Object.assign({}, state, {
                entries
            });
        }

        case TypeKeys.UPDATE_LABEL: {
            const entries = new Map(state.entries);
            entries.set(action.address, Object.assign({}, state.entries.get(action.address), { label: action.label }));

            return Object.assign({}, state, {
                entries
            });
        }

        // LOGOUT_LEGACY is also handled by wallet reducer
        case TypeKeys.REMOVE:
        case TypeKeys.LOGOUT_LEGACY: {
            const entries = new Map(state.entries);
            entries.delete(action.address);
            return Object.assign({}, state, {
                entries
            });
        }

        case WalletTypeKeys.LOGOUT: {
            const entries = new Map(state.entries);
            for (const address of action.addressesToRemove) {
                entries.delete(address);
            }

            return Object.assign({}, state, {
                entries
            });
        }

        default:
            return state
    }
}

export function addAccount(account) {
    if (Config.online) {
        // when adding a new account, subscribe at network
        networkClient.client.then(client => client.subscribe(account.address));
    }

    return {
        type: TypeKeys.ADD,
        account
    };
}

export function setAllAccounts(accounts) {
    if (Config.online) {
        // when adding a new account, subscribe at network.
        networkClient.client.then(client => client.subscribe(accounts.map(account => account.address)));
    }

    return {
        type: TypeKeys.SET_ALL,
        accounts
    };
}

export function updateBalances(balances) {
    return {
        type: TypeKeys.UPDATE_BALANCES,
        balances
    }
}

export function updateLabel(address, label) {
    return {
        type: TypeKeys.UPDATE_LABEL,
        address,
        label
    }
}

export function removeAccount(address) {
    return {
        type: TypeKeys.REMOVE,
        address,
    }
}

export function logoutLegacy(walletId) {
    return async (dispatch, getState) => {
        const state = getState();
        const account = [...state.accounts.entries.values() ].find(account => account.walletId === walletId);
        if (!account.isLegacy) throw new Error('Tried to log out an address');

        const legacyAccounts = legacyAccounts$(state); 

        const isLastLegacy = legacyAccounts.length === 1;

        dispatch({
            type: TypeKeys.LOGOUT_LEGACY,
            address: account.address,
            isLastLegacy // for wallet reducer
        });
    }
}
