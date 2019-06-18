import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import Config from './config/config.js';
import { reducer as transactionReducer } from './redux/transactions-redux.js';
import { reducer as networkReducer } from './redux/network-redux.js';
import { reducer as settingReducer } from './redux/settings-redux.js';
import { reducer as contactReducer } from './redux/contacts-redux.js';
import { reducer as walletReducer } from './redux/wallet-redux.js';

const reducers = {
    transactions: transactionReducer,
    network: networkReducer,
    settings: settingReducer,
    contacts: contactReducer,
    wallets: walletReducer,
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
