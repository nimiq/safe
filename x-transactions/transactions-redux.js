export const TypeKeys = {
    ADD_TXS: 'transactions/add-transactions',
    REMOVE_TXS: 'transactions/remove-transactions',
    UPDATE_BLOCK: 'transactions/updateBlock',
    SET_PAGE: 'transactions/set-page',
    SET_ITEMS_PER_PAGE: 'transactions/set-items-per-page',
    SET_REQUESTING_HISTORY: 'transactions/set-requesting-history'
};

export function reducer(state, action) {
    if (state === undefined) {
        return {
            entries: new Map(),
            hasContent: false,
            error: null,
            page: 1,
            itemsPerPage: 25
        }
    }

    switch (action.type) {
        case TypeKeys.ADD_TXS: {
            let entries = new Map(state.entries);

            if (action.transactions.length === 1) {
                // Check if this is a pending tx
                const tx = action.transactions[0];
                if (!tx.blockHeight) {
                    entries.set(tx.hash, tx);
                    return Object.assign({}, state, {
                        entries,
                        hasContent: true
                    });
                }
            }

            action.transactions.forEach(tx => entries.set(tx.hash, tx));
            // Sort as array
            entries = new Map([...entries].sort(_transactionSort));

            return Object.assign({}, state, {
                entries,
                hasContent: true
            });
        }
        case TypeKeys.REMOVE_TXS: {
            let entries = new Map(state.entries);

            action.hashes.forEach(hash => {
                if (!entries.get(hash).blockHeight
                 && action.currentHeight >= entries.get(hash).validityStartHeight + 120 || action.currentHeight === true) {
                    entries.delete(hash);
                }
            });

            return Object.assign({}, state, {
                entries,
                hasContent: true
            });
        }
        case TypeKeys.UPDATE_BLOCK:
            const oldEntry = state.entries.get(action.hash);
            return Object.assign({}, state, {
                entries: new Map(state.entries)
                    .set(action.hash, Object.assign({}, oldEntry, {
                        blockHeight: action.blockHeight,
                        timestamp: action.timestamp
                    }))
            });

        case TypeKeys.SET_PAGE:
            return Object.assign({}, state, {
                page: action.page
            });

        case TypeKeys.SET_ITEMS_PER_PAGE:
            return Object.assign({}, state, {
                itemsPerPage: action.itemsPerPage
            });

        case TypeKeys.SET_REQUESTING_HISTORY:
            return Object.assign({}, state, {
                isRequestingHistory: action.isRequestingHistory
            });

        default:
            return state
    }
}

/**
 * @param {Array<{}>} transactions
 */
export function addTransactions(transactions) {
    return {
        type: TypeKeys.ADD_TXS,
        transactions
    }
}

/**
 * @param {Array<string>} hashes
 * @param {Number|Boolean} currentHeight
 */
export function removeTransactions(hashes, currentHeight) {
    return {
        type: TypeKeys.REMOVE_TXS,
        hashes,
        currentHeight
    }
}

export function updateBlock(hash, blockHeight, timestamp) {
    return {
        type: TypeKeys.UPDATE_BLOCK,
        hash,
        blockHeight,
        timestamp
    }
}

export function setPage(page) {
    return {
        type: TypeKeys.SET_PAGE,
        page
    }
}

export function setItemsPerPage(itemsPerPage) {
    return {
        type: TypeKeys.SET_ITEMS_PER_PAGE,
        itemsPerPage
    }
}

export function setRequestingHistory(isRequestingHistory) {
    return {
        type: TypeKeys.SET_REQUESTING_HISTORY,
        isRequestingHistory
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
