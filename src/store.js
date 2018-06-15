import configureStore from './configure-store.js';
import { initialState as initialNetworkState } from '/elements/x-network-indicator/network-redux.js';
import { initialState as initialSettingsState } from './settings/settings-redux.js';

/* Redux store as singleton */
export class Store {
    static get instance() {
        this._instance = this._instance || this._initialize();

        return this._instance;
    }

    static _initialize() {
        // initialize from localStorage
        const stringifiedState = localStorage.getItem('persistedState');

        if (!stringifiedState) {
            return configureStore();
        }

        let persistedState = JSON.parse(stringifiedState);

        persistedState = Object.assign({},
            persistedState,
            {
                transactions: Object.assign({}, persistedState.transactions, {
                    entries: new Map(persistedState.transactions.entries)
                }),
                accounts: Object.assign({}, persistedState.accounts, {
                    entries: new Map(persistedState.accounts.entries)
                }),
                network: Object.assign({}, initialNetworkState, persistedState.network),
                settings: Object.assign({}, initialSettingsState, persistedState.settings)
            }
        );

        return configureStore(persistedState);
    }

    static persist() {
        const state = Store.instance.getState();

        const transactions = Object.assign({},
            state.transactions,
            {
                entries: [...state.transactions.entries.entries()],
                isRequestingHistory: undefined,
                page: 1
            }
        );

        const accounts =  Object.assign({},
            state.accounts,
            { entries: [...state.accounts.entries.entries()] }
        );

        const persistentState = {
            transactions,
            accounts,
            network: {
                oldHeight: state.network.height
            },
            settings: state.settings
        };

        const stringifiedState = JSON.stringify(persistentState);

        localStorage.setItem('persistedState', stringifiedState);
    }
}

export default Store.instance;
