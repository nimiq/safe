export const TypeKeys = {
    ADD_SINGLE: 'accounts/add-single',
    SET_ALL: 'accounts/set-all',
    UPDATE_BALANCE: '/accounts/updateBalance',
    SET_DEFAULT: 'accounts/set-default'
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
        case TypeKeys.ADD_SINGLE:
            return {
                ...state,
                entries: new Map(state.entries)
                    .set(action.account.address, action.account)
            };

        case TypeKeys.SET_ALL:
            return {
                ...state,
                // convert array to map with address as key
                entries: new Map(action.accounts.map(x => [x.address, x]))
            };

        case TypeKeys.UPDATE_BALANCE:
            const oldEntry = state.entries.get(action.address);

            return {
                ...state,
                entries: new Map(state.entries)
                    .set(action.address, {
                        ...oldEntry,
                        balance: action.balance
                    })
            };

        default:
            return state
    }
}

export function addSingle(account) {
    return {
        type: TypeKeys.ADD,
        account
    }
}

export function setAll(accounts) {
    return {
        type: TypeKeys.SET_ALL,
        accounts
    }
}

// todo properly design this store
// todo move to accounts component