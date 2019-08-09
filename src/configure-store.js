import { createStore, applyMiddleware, compose, combineReducers } from './lib/redux/src/index.js';
import { createLogger } from './lib/redux-logger/src/index.js';
import thunk from './lib/redux/src/redux-thunk.js';
import Config from './lib/config.js';
import { reducer as transactionReducer } from './elements/x-transactions/transactions-redux.js';
import { reducer as networkReducer } from './elements/x-network-indicator/network-redux.js';
import { reducer as settingReducer } from './settings/settings-redux.js';
import { reducer as contactReducer } from './elements/v-contact-list/contacts-redux.js';
import { reducer as walletReducer } from './wallet-redux.js';
import { reducer as cashlinkReducer } from './cashlink-redux.js';

const reducers = {
    transactions: transactionReducer,
    network: networkReducer,
    settings: settingReducer,
    contacts: contactReducer,
    wallets: walletReducer,
    cashlinks: cashlinkReducer,
};

export default function configureStore(initialState) {

    const createStoreWithMiddleware = compose(
        Config.productionMode
            ? applyMiddleware(
                thunk
            )
            : applyMiddleware(
                thunk,
                createLogger({
                    collapsed: true,
                    predicate: (getState, action) => true
                })
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
