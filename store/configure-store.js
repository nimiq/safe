import { createStore, applyMiddleware, compose, combineReducers } from '/libraries/redux/src/index.js';
import { createLogger } from '/libraries/redux-logger/src/index.js';
import { reducer as accountReducer } from './accounts.js';

const reducers = {
    accounts: accountReducer
}

const logger = createLogger({
    collapsed: true,
    predicate: (getState, action) => true
})

export default function configureStore(initialState) {

    const createStoreWithMiddleware = compose(
        applyMiddleware(
            logger
        )
    )(createStore);

    // Combine all reducers and instantiate the app-wide store instance
    const allReducers = buildRootReducer(reducers);
    const store = createStoreWithMiddleware(allReducers, initialState);

    return store;
}

function buildRootReducer (allReducers) {
    return combineReducers(allReducers);
}
