import { isFundingCashlink, isClaimingCashlink, convertExtradata } from './convert-extra-data.js';
import { TypeKeys as WalletTypeKeys } from '../../wallet-redux.js';
import { addCashlink, CashlinkStatus } from '../../cashlink-redux.js';

export const TypeKeys = {
    ADD_TXS: 'transactions/add-transactions',
    MARK_REMOVED: 'transactions/mark-removed',
    UPDATE_BLOCK: 'transactions/updateBlock',
    SET_PAGE: 'transactions/set-page',
    SET_ITEMS_PER_PAGE: 'transactions/set-items-per-page',
    SET_REQUESTING_HISTORY: 'transactions/set-requesting-history',
    SET_FILTER_UNCLAIMED_CASHLINKS: 'transactions/set-filter-unclaimed-cashlinks',
};

export function reducer(state, action) {
    if (state === undefined) {
        return {
            entries: new Map(),
            hasContent: false,
            error: null,
            page: 1,
            itemsPerPage: 4,
            filterUnclaimedCashlinks: false,
        }
    }

    switch (action.type) {
        case TypeKeys.ADD_TXS: {
            let entries = new Map(state.entries);

            if (action.transactions && action.transactions.length === 1) {
                // Check if this is a pending tx
                const tx = action.transactions[0];
                if (!tx.blockHeight) {
                    tx.extraData = convertExtradata(tx.extraData);
                    entries.set(tx.hash, tx); // Add to end of map
                    return Object.assign({}, state, {
                        entries,
                        hasContent: true,
                    });
                }
            }

            action.transactions.forEach(tx => {
                tx.extraData = convertExtradata(tx.extraData);
                entries.set(tx.hash, tx);
            });

            // Sort as array
            entries = new Map([...entries].sort(_transactionSort));

            return Object.assign({}, state, {
                entries,
                hasContent: true,
            });
        }
        case TypeKeys.MARK_REMOVED: {
            const entries = new Map(state.entries);

            action.hashes.forEach(hash => {
                const tx = entries.get(hash);
                // If the blockHeight is set, it means it's not a pending tx and can be marked as removed
                if (tx.blockHeight) {
                    entries.set(hash, Object.assign({},
                        tx,
                        {
                            'removed': true,
                            // blockHeight: action.currentHeight
                        }
                    ));
                }
                // If the blockHeight is not set, it means it's a pending tx. Receipts of pending tx are
                // also sent into the requestTransactionHistory function and thus come back in the
                // removedTransactions array, but should only be marked as expired if they are expired (older than 120 blocks)
                if (action.currentHeight >= tx.validityStartHeight + 120 || action.currentHeight === true) {
                    entries.set(hash, Object.assign({},
                        tx,
                        {
                            'expired': true,
                            blockHeight: action.currentHeight,
                        }
                    ));
                }
            });

            return Object.assign({}, state, {
                entries,
            });
        }
        case TypeKeys.UPDATE_BLOCK:
            const oldEntry = state.entries.get(action.hash);
            return Object.assign({}, state, {
                entries: new Map(state.entries)
                    .set(action.hash, Object.assign({}, oldEntry, {
                        blockHeight: action.blockHeight,
                        timestamp: action.timestamp,
                    }))
            });

        case TypeKeys.SET_PAGE:
            return Object.assign({}, state, {
                page: action.page,
            });

        case TypeKeys.SET_ITEMS_PER_PAGE:
            return Object.assign({}, state, {
                itemsPerPage: action.itemsPerPage,
            });

        case TypeKeys.SET_REQUESTING_HISTORY:
            return Object.assign({}, state, {
                isRequestingHistory: action.isRequestingHistory,
            });

        case TypeKeys.SET_FILTER_UNCLAIMED_CASHLINKS:
            return Object.assign({}, state, {
                filterUnclaimedCashlinks: action.value,
                page: 1,
            });

        case WalletTypeKeys.LOGOUT:
        case WalletTypeKeys.REMOVE_ACCOUNT:
        case WalletTypeKeys.POPULATE: {
            const entries = new Map(state.entries);
            const entriesArray = [...state.entries.values()];

            const userfriendlyAddressesToKeep = action.addressesToKeep.map(a => a.address);
            for (const tx of entriesArray) {
                if (!userfriendlyAddressesToKeep.includes(tx.sender) && !userfriendlyAddressesToKeep.includes(tx.recipient)) {
                    entries.delete(tx.hash);
                }
            }

            return Object.assign({}, state, {
                entries,
                page: 1,
                filterUnclaimedCashlinks: false,
            });
        }

        case WalletTypeKeys.SWITCH:
            return Object.assign({}, state, {
                page: 1,
                filterUnclaimedCashlinks: false,
            });

        default:
            return state;
    }
}

/**
 * @param {Array<{}>} transactions
 */
export function addTransactions(transactions) {
    return async (dispatch, getState) => {
        /** @type {Map<string, any>} */
        const accounts = getState().wallets.accounts;

        // Look through tx and find cashlinks, so we can add their address to our monitored addresses
        transactions.forEach(tx => {
            if (isFundingCashlink(tx.extraData)) {
                tx.isCashlink = 'funding';

                const sender = accounts.get(tx.sender);

                dispatch(addCashlink({
                    address: tx.recipient,
                    status: tx.timestamp ? CashlinkStatus.UNCLAIMED : CashlinkStatus.CHARGING,
                    sender: tx.sender,
                    walletIds: sender ? [sender.walletId] : [],
                }));
            }
            else if (isClaimingCashlink(tx.extraData)) {
                tx.isCashlink = 'claiming';

                const recipient = accounts.get(tx.recipient);

                dispatch(addCashlink({
                    address: tx.sender,
                    status: tx.timestamp ? CashlinkStatus.CLAIMED : CashlinkStatus.CLAIMING,
                    recipient: tx.recipient,
                    walletIds: recipient ? [recipient.walletId] : [],
                }));
            }
        });

        dispatch({
            type: TypeKeys.ADD_TXS,
            transactions,
        });
    };
}

/**
 * @param {Array<string>} hashes
 * @param {Number|Boolean} currentHeight
 */
export function markRemoved(hashes, currentHeight) {
    return {
        type: TypeKeys.MARK_REMOVED,
        hashes,
        currentHeight,
    }
}

export function updateBlock(hash, blockHeight, timestamp) {
    return {
        type: TypeKeys.UPDATE_BLOCK,
        hash,
        blockHeight,
        timestamp,
    }
}

export function setPage(page) {
    return {
        type: TypeKeys.SET_PAGE,
        page,
    }
}

export function setItemsPerPage(itemsPerPage) {
    return {
        type: TypeKeys.SET_ITEMS_PER_PAGE,
        itemsPerPage,
    }
}

export function setRequestingHistory(isRequestingHistory) {
    return {
        type: TypeKeys.SET_REQUESTING_HISTORY,
        isRequestingHistory,
    }
}

export function setFilterUnclaimedCashlinks(value) {
    return {
        type: TypeKeys.SET_FILTER_UNCLAIMED_CASHLINKS,
        value,
    }
}

export function _transactionSort(left, right) {
    if (!left[1].blockHeight && !right[1].blockHeight) {
        // Both tx are pending, sort by validityStartHeight
        return left[1].validityStartHeight - right[1].validityStartHeight;
    }
    else if (!left[1].blockHeight) return 1; // sort left after
    else if (!right[1].blockHeight) return -1; // sort left before
    else return left[1].blockHeight - right[1].blockHeight;
}
