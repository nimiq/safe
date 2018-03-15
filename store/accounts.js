export const TypeKeys = {
    ADD: 'accounts/add',
    LOAD: 'accounts/load',
    UPDATE_BALANCE: '/accounts/updateBalance'

};

export function reducer(state, action) {
    if (state === undefined) {
        return {
            volatileAccounts: new Map(),
            toBePersisted: null
        }
    }

    switch (action.type) {
        case TypeKeys.ADD:
            return {
                ...state,
                volatileAccounts: new Map(state.volatileAccounts).set(action.account.userFriendlyAddress, action.account)
            };

        case TypeKeys.CLEAR:
            return {
                ...state,
                volatileAccounts: new Map()
            };

        case TypeKeys.REQUEST_PERSIST:
            return {
                ...state,
                toBePersisted: action.accountNumber
            };

        case TypeKeys.CLEAR_PERSIST:
            return {
                ...state,
                toBePersisted: null
            };

        default:
            return state
    }
}

export function addVolatile(account) {
    return {
        type: TypeKeys.ADD,
        account
    }
}

export function clearVolatile() {
    return {
        type: TypeKeys.CLEAR
    }
}

export function requestPersist(accountNumber) {
    return {
        type: TypeKeys.REQUEST_PERSIST,
        accountNumber
    }
}

export function clearPersist() {
    return {
        type: TypeKeys.CLEAR_PERSIST,
    }
}


// todo properly design this store
// todo move to accounts component