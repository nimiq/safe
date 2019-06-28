import networkClient from './network-client.js';

export const TypeKeys = {
    ADD_ACCOUNT: 'wallet/add-account',
    LOGIN: 'wallet/login',
    LOGOUT: 'wallet/logout',
    REMOVE_ACCOUNT: 'wallet/remove-account',
    POPULATE: 'wallet/populate',
    SET_WORDS_FLAG: 'wallet/set-words-flag',
    SET_FILE_FLAG: 'wallet/set-file-flag',
    SWITCH: 'wallet/switch',
    RENAME: 'wallet/rename',
    UPDATE_BALANCES: 'wallet/update-balances',
};

export const CashlinkStatus = {
    UNCHARGED: 0,
    CHARGING: 1,
    UNCLAIMED: 2,
    CLAIMING: 3,
    CLAIMED: 4,
};

const initialState = {
    cashlinks: new Map(), // Map<string, CashlinkInfo>, {string} being the cashlink address
    loading: false,
    hasContent: false,
};

/* Reducer: State machine where changes happen */

export function reducer(state, action) {
    if (state === undefined) {
        return initialState;
    }

    switch (action.type) {
        case TypeKeys.ADD_ACCOUNT:
            return state;
    }
}

/* Action creators */

/**
 * @typedef {0|1|2|3|4} CashlinkStatus
 * @typedef {{address: string, message: string, status: CashlinkStatus, recipient?: string, sender?: string}} CashlinkInfo
 */

/**
 * @param {CashlinkInfo} cashlink
 */
export function addCashlink(cashlink) {
    // subscribe at network
    networkClient.client.then(client => client.subscribe(account.address));

    return {
        type: TypeKeys.ADD_ACCOUNT,
        account
    };
}

export function populate(listedCashlinks) {
    // subscribe addresses at network
    const addressInfos = listedWallets.map(wallet => wallet.addresses.concat(wallet.contracts))
        .reduce((acc, addresses) => acc.concat(addresses), []);

    return async (dispatch) => {
        dispatch({
            type: TypeKeys.POPULATE,
            listedWallets,
            addressesToKeep: addressInfos,
        });

        const addresses = addressInfos.map(addressInfo => addressInfo.address);

        const client = await networkClient.client;
        client.subscribe(addresses);
    }
}

/**
 * @param {string} cashlinkAddress
 * @param {string} finalRecipient
 */
export function setClaimed(cashlinkAddress, finalRecipient) {

}

/**
 * @param {string} cashlinkAddress
 * @param {string} originalSender
 */
export function setCharged(cashlinkAddress, originalSender) {

}
