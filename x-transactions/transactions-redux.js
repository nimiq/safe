export const TypeKeys = {
    ADD_TXS: 'transactions/add-transactions',
    UPDATE_BLOCK: '/transactions/updateBlock',
    SET_DEFAULT: 'transactions/set-default'
};

export function reducer(state, action) {
    if (state === undefined) {
        return {
            entries: new Map(),
            hasContent: false,
            error: null
        }
    }

    switch (action.type) {
        case TypeKeys.ADD_TXS:
            const entries = new Map(state.entries);
            action.transactions.forEach(tx => entries.set(tx.hash, tx));
            return {
                ...state,
                hasContent: true,
                entries
            };

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
            };

        default:
            return state
    }
}

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
