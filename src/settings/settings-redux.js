export const TypeKeys = {
    SHOW_ALL_DECIMALS: 'settings/show-all-decimals',
};

export const initialState = {
    showAllDecimals: false
};

export function reducer(state, action) {
    if (state === undefined) {
        return initialState;
    }

    switch (action.type) {
        case TypeKeys.SHOW_ALL_DECIMALS:
            return Object.assign({}, state, {
                showAllDecimals: action.showAllDecimals
            });

        default:
           return state
    }
}

export function showAllDecimals(showAllDecimals) {
    return {
        type: TypeKeys.SHOW_ALL_DECIMALS,
        showAllDecimals
    }
}
