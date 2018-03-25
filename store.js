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

        const persistedState = JSON.parse(stringifiedState);

        const transactions = new Map(persistedState.transactions);
        const accounts = new Map(persistedState.accounts);

        const initialState = {
            transactions: {
                entries: transactions,
                hasContent: true
            },
            accounts: {
                entries: accounts
            }
        };

        return configureStore(initialState);
    }
}

export default Store.instance;
