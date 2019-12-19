import networkClient from './network-client.js';

export const TypeKeys = {
    POPULATE: 'cashlink/populate',
    ADD: 'cashlink/add',
    SET_STATUS: 'cashlink/set-status',
    ADD_WALLET: 'cashlink/add-wallet',
};

export const CashlinkStatus = {
    UNKNOWN: -1,
    UNCHARGED: 0,
    CHARGING: 1,
    UNCLAIMED: 2,
    CLAIMING: 3,
    CLAIMED: 4,
};

export const CashlinkDirection = {
    FUNDING: 'funding',
    CLAIMING: 'claiming',
};

export const initialState = {
    cashlinks: new Map(), // Map<string, CashlinkInfo>, {string} being the cashlink address
    loading: true,
    hasContent: false,
};

/* Reducer: State machine where changes happen */

export function reducer(state, action) {
    if (state === undefined) {
        return initialState;
    }

    function updateCashlink(oldEntry, newEntry) {
        return Object.assign({}, oldEntry, newEntry, {
            managed: oldEntry.managed || newEntry.managed || false,
            walletIds: oldEntry.walletIds
                .concat(newEntry.walletIds)
                .filter((v, i, a) => a.indexOf(v) === i),
            status: Math.max(oldEntry.status, newEntry.status),
            sender: newEntry.sender || oldEntry.sender,
            recipient: newEntry.recipient || oldEntry.recipient,
        });
    }

    switch (action.type) {
        case TypeKeys.ADD:
            action.cashlink.managed = action.cashlink.managed || false;
            action.listedCashlinks = [action.cashlink];
            action.onlySubscribeNew = true;
            // Fall through to POPULATE
        case TypeKeys.POPULATE:
            const cashlinks = new Map(state.cashlinks);

            const unkownCashlinkAddresses = new Set(action.listedCashlinks.map(cashlink => cashlink.address));

            for (const cashlink of action.listedCashlinks) {
                const storedCashlink = cashlinks.get(cashlink.address);
                if (storedCashlink) unkownCashlinkAddresses.delete(cashlink.address);

                // Add additional Safe-specific properties
                cashlink.managed = 'managed' in cashlink ? cashlink.managed : true;
                cashlink.walletIds = cashlink.walletIds || [];

                cashlinks.set(
                    cashlink.address,
                    storedCashlink
                        ? updateCashlink(storedCashlink, cashlink)
                        : cashlink
                );
            }

            // Subscribe addresses of unclaimed cashlinks at network
            let addresses = [...cashlinks.values()]
                .filter(cashlink => cashlink.status <= CashlinkStatus.CLAIMING)
                .map(cashlink => cashlink.address);

            if (action.onlySubscribeNew) {
                // Only subscribe to unknown cashlinks
                addresses = addresses.filter(address => unkownCashlinkAddresses.has(address));
            }

            networkClient.client.then(client => client.subscribe(addresses));

            return Object.assign({}, state, {
                cashlinks,
                loading: false,
                hasContent: true,
            });

        case TypeKeys.SET_STATUS: {
            const oldEntry = state.cashlinks.get(action.address);
            const newEntry = Object.assign({}, oldEntry, {
                status: Math.max(oldEntry.status, action.status),
            });

            if (action.recipient) {
                newEntry.recipient = action.recipient;
            }

            return Object.assign({}, state, {
                cashlinks: new Map(state.cashlinks).set(action.address, newEntry),
            });
        }
        case TypeKeys.ADD_WALLET: {
            const oldEntry = state.cashlinks.get(action.address);
            return Object.assign({}, state, {
                cashlinks: new Map(state.cashlinks).set(action.address, Object.assign({}, oldEntry, {
                    walletIds: oldEntry.walletIds.includes(action.walletId)
                        ? oldEntry.walletIds
                        : oldEntry.walletIds.concat(action.walletId),
                })),
            });
        }
        default:
            return state;
    }
}

/* Action creators */

/**
 * @typedef {-1|0|1|2|3|4} CashlinkStatus
 * @typedef {{address: string, message?: string, status: CashlinkStatus, sender?: string, recipient?: string}} CashlinkInfo
 */

/**
 * @param {CashlinkInfo} cashlink
 */
export function addCashlink(cashlink) {
    return {
        type: TypeKeys.ADD,
        cashlink,
    };
}

export function populate(listedCashlinks, onlySubscribeNew = false) {
    return {
        type: TypeKeys.POPULATE,
        listedCashlinks,
        onlySubscribeNew,
    };
}

/**
 * @param {string} address
 * @param {CashlinkStatus} status
 * @param {string} [recipient]
 */
export function setStatus(address, status, recipient) {
    return {
        type: TypeKeys.SET_STATUS,
        address,
        status,
        recipient,
    }
}

/**
 * @param {string} address
 * @param {string} walletId
 */
export function addWallet(address, walletId) {
    return {
        type: TypeKeys.ADD_WALLET,
        address,
        walletId,
    }
}
