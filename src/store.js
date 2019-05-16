import configureStore from './configure-store.js';
import { initialState as initialNetworkState } from './elements/x-network-indicator/network-redux.js';
import { initialState as initialSettingsState } from './settings/settings-redux.js';
import { initialState as initialWalletState } from './wallet-redux.js';

const CACHE_VERSION = 2;

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

        const initialState = {};
  
        if (stringifiedState) {
            const persistedState = JSON.parse(stringifiedState);

            // ignore outdated cache
            if (persistedState.version === CACHE_VERSION) {
                initialState.transactions = Object.assign({}, persistedState.transactions, {
                    entries: new Map(persistedState.transactions.entries)
                });
                initialState.wallets = Object.assign({}, initialWalletState, persistedState.wallets, {
                    wallets: new Map(persistedState.wallets ? persistedState.wallets.wallets : []),
                    accounts: new Map(persistedState.wallets ? persistedState.wallets.accounts: [])
                });
                initialState.network = Object.assign({}, initialNetworkState, persistedState.network);
                initialState.settings = Object.assign({}, initialSettingsState, persistedState.settings);
                
                // support legacy version of persisted contacts
                if (persistedState.contacts) {
                    initialState.contacts = Object.assign({}, persistedState.contacts);
                }
            }
        }

        if (persistedContacts) {
            initialState.contacts = Object.assign({}, persistedContacts);
        }

        return configureStore(initialState);
    }

    static persist() {
        const state = Store.instance.getState();

        const transactions = Object.assign({},
            state.transactions,
            {
                entries: [...state.transactions.entries.entries()],
                isRequestingHistory: undefined,
                page: 1,
                itemsPerPage: 4,
            }
        );

        const wallets =  Object.assign({},
            state.wallets,
            {
                wallets: [...state.wallets.wallets.entries()],
                accounts: [...state.wallets.accounts.entries()],
            }
        );

        const persistentState = {
            version: CACHE_VERSION,
            transactions,
            wallets,
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
