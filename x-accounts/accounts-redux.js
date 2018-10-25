// todo, to be discussed: abstract the functionality we need here in a generic network store OR consider network-client
// as generic solution, so network-client should move to libraries? - We could also move the async functions to
// account-manager.js

import networkClient from '/apps/safe/src/network-client.js';
import Config from '/libraries/secure-utils/config/config.js';
import AccountType from '/libraries/account-manager/account-type.js';
import { TypeKeys as WalletTypeKeys } from '/apps/safe/src/wallet-redux.js';

export const TypeKeys = {
    ADD_KEY: 'accounts/add-key',
    SET_ALL_KEYS: 'accounts/set-all-keys',
    UPDATE_BALANCES: 'accounts/update-balances',
    UPDATE_LABEL: 'accounts/update-label',
    UPGRADE_CANCELED: 'accounts/upgrade-canceled',
    UPGRADE: 'accounts/upgrade',
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
            return Object.assign({}, state, {
                hasContent: true,
                entries: new Map(state.entries)
                    .set(action.key.address, Object.assign({}, action.key, {
                        balance: undefined
                    }))
            });

        case TypeKeys.SET_ALL_KEYS:
            const newEntries = action.keys.map(x => {
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

        case TypeKeys.UPGRADE_CANCELED: {
            const entries = new Map(state.entries);
            entries.set(action.address, Object.assign({}, state.entries.get(action.address), {
                upgradeCanceled: Date.now()
            }));

            return Object.assign({}, state, {
                entries
            });
        }

        case TypeKeys.UPGRADE: {
            const entries = new Map(state.entries);
            entries.set(action.address, Object.assign({}, state.entries.get(action.address), {
                type: AccountType.KEYGUARD_HIGH
            }));

            return Object.assign({}, state, {
                entries
            });
        }

        case WalletTypeKeys.LOGOUT: {
            const entries = new Map(state.entries);
            for (const address of action.addresses) {
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

export function addAccount(key) {
    if (Config.online) {
        // when adding a new account, subscribe at network
        networkClient.rpcClient.then(rpcClient => rpcClient.subscribe(key.address));
    }

    return {
        type: TypeKeys.ADD_KEY,
        key
    };
}

export function setAllKeys(keys) {
    if (Config.online) {
        // when adding a new account, subscribe at network.
        networkClient.rpcClient.then(rpcClient => rpcClient.subscribe(keys.map(key => key.address)));
    }

    return {
        type: TypeKeys.SET_ALL_KEYS,
        keys
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

export function upgradeCanceled(address) {
    return {
        type: TypeKeys.UPGRADE_CANCELED,
        address
    }
}

export function upgrade(address) {
    return {
        type: TypeKeys.UPGRADE,
        address
    }
}
