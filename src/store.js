import configureStore from './configure-store.js';
import { initialState as initialNetworkState } from './elements/x-network-indicator/network-redux.js';
import { initialState as initialSettingsState } from './settings/settings-redux.js';
import { initialState as initialWalletState } from './wallet-redux.js';
import { initialState as initialCashlinkState, CashlinkStatus } from './cashlink-redux.js';
import { AddressBook } from '../node_modules/@nimiq/utils/dist/module/AddressBook.js';

const CACHE_VERSION = 3;

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
                    accounts: new Map(persistedState.wallets ? persistedState.wallets.accounts: []),
                    hasContent: false,
                });
                initialState.cashlinks = Object.assign({}, initialCashlinkState, persistedState.cashlinks, {
                    cashlinks: new Map(persistedState.cashlinks.cashlinks),
                });
                initialState.network = Object.assign({}, initialNetworkState, persistedState.network);
                initialState.settings = Object.assign({}, initialSettingsState, persistedState.settings);
            }

            // support legacy version of persisted contacts
            if (persistedState.contacts) {
                initialState.contacts = Object.assign({}, persistedState.contacts);
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
                filterUnclaimedCashlinks: false,
            }
        );

        const wallets =  Object.assign({},
            state.wallets,
            {
                wallets: [...state.wallets.wallets.entries()],
                accounts: [...state.wallets.accounts.entries()],
            }
        );

        const cashlinks = Object.assign({},
            state.cashlinks,
            {
                cashlinks: [...state.cashlinks.cashlinks.entries()],
            }
        );

        const persistentState = {
            version: CACHE_VERSION,
            transactions,
            wallets,
            cashlinks,
            network: {
                oldHeight: state.network.height
            },
            settings: state.settings,
        };

        const stringifiedState = JSON.stringify(persistentState);
        localStorage.setItem('persistedState', stringifiedState);

        this.persistContacts();
    }

    static persistContacts() {
        const state = Store.instance.getState();

        const persistentContacts = state.contacts;

        const stringifiedContacts = JSON.stringify(persistentContacts);
        localStorage.setItem('persistedContacts', stringifiedContacts);
    }



    /**
     * @param {Map<string, any> | any[]} txs
     */
    static labelTransactions(txs) {
        const state = Store.instance.getState();
        const accounts = state.wallets.accounts;
        const contacts = state.contacts;
        const cashlinks = state.cashlinks.cashlinks;

        txs.forEach(tx => {
            const sender = accounts.get(tx.sender);
            const recipient = accounts.get(tx.recipient);

            tx.senderLabel = Store._labelAddress(tx.sender, sender, contacts, cashlinks);
            tx.recipientLabel = Store._labelAddress(tx.recipient, recipient, contacts, cashlinks);

            if (tx.pairedTx) {
                const pairedSender = accounts.get(tx.sender);
                const pairedRecipient = accounts.get(tx.recipient);

                tx.pairedTx.senderLabel = Store._labelAddress(tx.pairedTx.sender, pairedSender, contacts, cashlinks);
                tx.pairedTx.recipientLabel = Store._labelAddress(tx.pairedTx.recipient, pairedRecipient, contacts, cashlinks);
            }
        });

        return txs;
    }

    static _labelAddress(address, account, contacts, cashlinks) {
        return account
            ? account.label
            : contacts[address]
                ? contacts[address].label
                : AddressBook.getLabel(address)
                    ? AddressBook.getLabel(address)
                    : cashlinks.has(address)
                        ? cashlinks.get(address).status <= CashlinkStatus.UNCLAIMED ? 'Unclaimed Cashlink' : 'Cashlink'
                        : address.slice(0, 14) + '...';
    }
}

export default Store.instance;
