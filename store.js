import configureStore from './configure-store.js';

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

        persistedState = {
            ...persistedState,
            transactions: {
                ...persistedState.transactions,
                entries: new Map(persistedState.transactions.entries)
            },
            accounts: {
                ...persistedState.accounts,
                entries: new Map(persistedState.accounts.entries)
            }
        };

        return configureStore(persistedState);
    }
}

export default Store.instance;
