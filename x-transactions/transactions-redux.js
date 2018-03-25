export const TypeKeys = {
    ADD_TXS: 'transactions/add-transactions',
    UPDATE_BLOCK: 'transactions/updateBlock',
    SET_PAGE: 'transactions/set-page',
    SET_ITEMS_PER_PAGE: 'transactions/set-items-per-page'

};

export function reducer(state, action) {
    if (state === undefined) {
        return {
            entries: new Map(),
            hasContent: false,
            error: null,
            page: 1,
            itemsPerPage: 5
        }
    }

    switch (action.type) {
        case TypeKeys.ADD_TXS:
            let entries = new Map(state.entries);

            if (action.transactions.length === 1) {
                // Check if this is a pending tx
                const tx = action.transactions[0];
                if (!tx.blockHeight) {
                    entries.set(tx.hash, tx);
                    return {
                        ...state,
                        entries,
                        hasContent: true
                    }
                }
            }

            action.transactions.forEach(tx => entries.set(tx.hash, tx));
            // Sort as array
            entries = new Map([...entries].sort(_transactionSort));

            return {
                ...state,
                entries,
                hasContent: true
            }

        case TypeKeys.UPDATE_BLOCK:
            const oldEntry = state.entries.get(action.hash);
            return {
                ...state,
                entries: new Map(state.entries)
                    .set(action.hash, {
                        ...oldEntry,
                        blockHeight: action.blockHeight,
                        timestamp: action.timestamp
                    })
            }

        case TypeKeys.SET_PAGE:
            return {
                ...state,
                page: action.page
            }

        case TypeKeys.SET_ITEMS_PER_PAGE:
            return {
                ...state,
                itemsPerPage: action.itemsPerPage
            }

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

export function _transactionSort(a, b) {
    return a[1].blockHeight - b[1].blockHeight;
}
