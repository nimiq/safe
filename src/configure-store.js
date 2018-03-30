import { createStore, applyMiddleware, compose, combineReducers } from '/libraries/redux/src/index.js';
import { createLogger } from '/libraries/redux-logger/src/index.js';
import thunk from '/libraries/redux/src/redux-thunk.js';
import { reducer as accountReducer } from '/elements/x-accounts/accounts-redux.js';
import { reducer as transactionReducer } from '/elements/x-transactions/transactions-redux.js';
import { reducer as networkReducer } from '/elements/x-network-indicator/network-redux.js';

const reducers = {
    accounts: accountReducer,
    transactions: transactionReducer,
    network: networkReducer
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
