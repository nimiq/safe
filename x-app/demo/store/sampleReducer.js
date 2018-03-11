export const TypeKeys = {
    ADD: 'demo/add',
    REMOVE: 'demo/remove'
};

export function reducer(state, action) {
    if (state === undefined) {
        return {
            myMap: new Map(),
            counter: 0
        }
    }

    switch (action.type) {
        case TypeKeys.ADD:
            return {
                ...state,
                myMap: new Map(state.myMap).set(action.key, action.value),
                counter: state. counter + 1
            };

        case TypeKeys.REMOVE:
            return {
                ...state,
                myMap: new Map(state.myMap).delete(key),
                counter: state.counter - 1
            };

        default:
            return state
    }
}

export function add(key, value) {
    return {
        type: TypeKeys.ADD,
        key,
        value
    }
}

export function remove(key) {
    return {
        type: TypeKeys.REMOVE,
        key
    }
}
