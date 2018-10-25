import configureStore from './configure-store.js';
import { initialState as initialNetworkState } from '/elements/x-network-indicator/network-redux.js';
import { initialState as initialSettingsState } from './settings/settings-redux.js';
import { initialState as initialWalletState } from './wallet-redux.js';

/* Redux store as singleton */
export class Store {
    static get instance() {
        this._instance = this._instance || this._initialize();

        return this._instance;
    }

    static _initialize() {
        // initialize from localStorage
        const stringifiedState = localStorage.getItem('persistedState');

        const stringifiedContacts = localStorage.getItem('persistedContacts');
        const persistedContacts = JSON.parse(stringifiedContacts);

        if (!stringifiedState) {
            if (persistedContacts) {
                return configureStore({
                    contacts: Object.assign({}, persistedContacts),
                });
            }

            return configureStore();
        }

        let persistedState = JSON.parse(stringifiedState);

        persistedState = Object.assign({},
            persistedState,
            {
                transactions: Object.assign({}, persistedState.transactions, {
                    entries: new Map(persistedState.transactions.entries)
                }),
                wallets: Object.assign({}, initialWalletState, persistedState.wallets, {
                    entries: new Map(persistedState.wallets ? persistedState.wallets.entries : [])
                }),
                accounts: Object.assign({}, persistedState.accounts, {
                    entries: new Map(persistedState.accounts.entries)
                }),
                network: Object.assign({}, initialNetworkState, persistedState.network),
                settings: Object.assign({}, initialSettingsState, persistedState.settings),
                contacts: Object.assign({}, persistedState.contacts || {}, persistedContacts || {}),
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

        const wallets =  Object.assign({},
            state.wallets,
            { entries: [...state.wallets.entries.entries()] }
        );

        const accounts =  Object.assign({},
            state.accounts,
            { entries: [...state.accounts.entries.entries()] }
        );

        const persistentState = {
            transactions,
            wallets,
            accounts,
            network: {
                oldHeight: state.network.height
            },
            settings: state.settings,
        };
        const persistentContacts = state.contacts;

        const stringifiedState = JSON.stringify(persistentState);
        const stringifiedContacts = JSON.stringify(persistentContacts);

        localStorage.setItem('persistedState', stringifiedState);
        localStorage.setItem('persistedContacts', stringifiedContacts);
    }
}

export default Store.instance;
