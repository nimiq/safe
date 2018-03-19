import { createStore, applyMiddleware, compose, combineReducers } from '/libraries/redux/src/index.js';
import { createLogger } from '/libraries/redux-logger/src/index.js';
import thunk from '/libraries/redux/src/redux-thunk.js';
import { reducer as accountReducer } from './accounts.js';
import { reducer as networkReducer } from './network.js';
import { reducer as transactionReducer } from './transactions.js';

const reducers = {
    accounts: accountReducer,
    network: networkReducer,
    transactions: transactionReducer
};

const logger = createLogger({
    collapsed: true,
    predicate: (getState, action) => true
});

export default function configureStore(initialState) {

    const createStoreWithMiddleware = compose(
        applyMiddleware(
            thunk,
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
