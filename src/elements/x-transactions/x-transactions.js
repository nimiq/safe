import XElement from '../../lib/x-element/x-element.js';
import MixinRedux from '../mixin-redux.js';
import XTransaction from './x-transaction.js';
import XTransactionModal from './x-transaction-modal.js';
import XNoTransactions from './x-no-transactions.js';
import XPaginator from '../x-paginator/x-paginator.js';
import { addTransactions, markRemoved, setRequestingHistory, setPage, setItemsPerPage, setFilterUnclaimedCashlinks } from './transactions-redux.js';
import networkClient from '../../network-client.js';
import XPopupMenu from '../x-popup-menu/x-popup-menu.js';
import Config from '../../lib/config.js';
import { relevantTransactions$ } from '../../selectors/transaction$.js';
import { numberUnclaimedCashlinks$ } from '../../selectors/cashlink$.js';
import { Store } from '../../store.js';

export default class XTransactions extends MixinRedux(XElement) {
    html() {
        return `
            <div class="hide-if-filtered">
                <x-popup-menu x-main-action-only x-loading-tooltip="Refreshing transaction history" x-icon="refresh" class="refresh"></x-popup-menu>
                <h2 class="transactions-heading">Transactions</h2>
                <button class="nq-button-s filter-unclaimed-cashlinks display-none"></button>
            </div>
            <div class="transactions-filtered-header nq-blue-bg show-if-filtered">
                <h2>Unclaimed Cashlinks</h2>
                <button class="nq-button-s inverse filter-close-button">&times;</button>
            </div>
            <x-loading-animation></x-loading-animation>
            <h2 class="loading-headline">Loading transactions...</h2>
            <table class="x-transactions-list"></table>
            <x-paginator store-path="transactions"></x-paginator>
            <a secondary class="view-more">View more</a>
            <a secondary class="view-less">View less</a>
        `
    }

    children() { return [ XPopupMenu, XPaginator ] }

    onCreate() {
        this._$transactions = new Map();
        this.$transactionsList = this.$('table');
        this.properties.onlyRecent = !!this.attributes.onlyRecent;
        this.$filterUnclaimedCashlinks = this.$('.filter-unclaimed-cashlinks');
        this.$popupMenu.noMenu = this.attributes.noMenu;
        super.onCreate();
    }

    listeners() {
        return {
            'x-transaction-selected': this._onTransactionSelected,
            'click .refresh button': () => this.requestTransactionHistory(),
            'click .view-more': this._onViewMore,
            'click .view-less': this._onViewLess,
            'click .filter-unclaimed-cashlinks': this._toggleFilterUnclaimedCashlinks,
            'click .filter-close-button': this._toggleFilterUnclaimedCashlinks,
        }
    }

    static get actions() { return { addTransactions, markRemoved, setRequestingHistory, setPage, setItemsPerPage, setFilterUnclaimedCashlinks } }

    static mapStateToProps(state, props) {
        return {
            transactions: XTransactions._processTransactions(
                relevantTransactions$(state) || new Map(),
                state.transactions.page,
                state.transactions.itemsPerPage,
            ),
            hasTransactions: state.transactions.hasContent,
            totalTransactionCount: (relevantTransactions$(state) || new Map()).size,
            addresses: [...state.wallets.accounts.keys()].concat([...state.cashlinks.cashlinks.keys()]),
            hasAccounts: state.wallets.hasContent,
            lastKnownHeight: state.network.height || state.network.oldHeight,
            isRequestingHistory: state.transactions.isRequestingHistory,
            filterUnclaimedCashlinks: state.transactions.filterUnclaimedCashlinks,
            numberUnclaimedCashlinks: numberUnclaimedCashlinks$(state) || 0,
        }
    }

    /**
     * @param {Map<string, any>} txs
     * @param {number} page
     * @param {number} itemsPerPage
     */
    static _processTransactions(txs, page, itemsPerPage) {
        const pagedTxs = XPaginator.getPagedItems(txs, page, itemsPerPage, true);
        return Store.labelTransactions(pagedTxs);
    }

    _onPropertiesChanged(changes) {
        if (!this.attributes.passive) {
            if (changes.hasAccounts && this.properties.addresses.length === 0) {
                // Empty state
                this.actions.addTransactions([]);
            }
            else if (changes.addresses && changes.addresses instanceof Array && changes.addresses.length > 0) {
                // Called when state is loaded from persisted state (deepdiff returns the accounts as the new array)
                this.requestTransactionHistory(changes.addresses);
            }
            else if (changes.addresses && !(changes.addresses instanceof Array)) {
                // Called when an account is added (deepdiff returns array diff as object)
                let newAddresses = Object.values(changes.addresses);
                // Filter out deleted addresses
                newAddresses = newAddresses.filter(a => !!a);
                // console.log("ADDRESSES CHANGED, REQUESTING TX HISTORY FOR", newAddresses);
                this.requestTransactionHistory(newAddresses);
            }
        }

        if (changes.isRequestingHistory) {
            this.$popupMenu.loading = true;
        }
        else if (changes.isRequestingHistory !== undefined) {
            this.$popupMenu.loading = false;
        }

        if (!this.properties.hasTransactions) return;

        if (changes.transactions || this.properties.transactions.size === 0) {
            if (this.$('x-loading-animation')) {
                this.$el.removeChild(this.$('x-loading-animation'));
                this.$el.removeChild(this.$('.loading-headline'));
            }
        }

        if (changes.transactions) {
            if (this.$('x-no-transactions')) {
                this.$transactionsList.removeChild(this.$('x-no-transactions'));
            }

            // Transaction-internal updates are handled by the XTransaction
            // elements themselves, so we only need to handle reordering and
            // removed tx here.

            // Check if the changes include a new hash or a
            // blockHeight, which would make sorting necessary
            let needsSorting = false;

            const removedTx = [];

            for (const [hash, transaction] of changes.transactions) {
                if (transaction === undefined) removedTx.push(hash);
                else if (transaction.hash || transaction.blockHeight) {
                    needsSorting = true;
                }
            }

            // Remove the XTransaction elements of removed tx
            if (removedTx.length > 0) {
                for (const hash of removedTx) {
                    const $transaction = this._$transactions.get(hash);
                    $transaction && $transaction.destroy();
                    this._$transactions.delete(hash);
                }
            }

            if (needsSorting) {
                // Reorder existing elements and create new ones as required

                // Get XTransaction elements in reverse DOM order
                const xTransactions = [...this._$transactions.values()];
                this._$transactions = new Map();

                // Set XTransaction transaction to object in this.properties.transactions
                let i = 0;
                for (const [hash, transaction] of this.properties.transactions) {
                    if (xTransactions[i]) {
                        // transaction.triggeredByList = true;
                        xTransactions[i].transaction = transaction;
                        this._$transactions.set(hash, xTransactions[i]);
                    }
                    else {
                        // When no more XTransactions, create new ones
                        this.addTransaction(transaction);
                    }
                    i++;
                }

                // DEBUGGING: Validate order of this._$transactions map
                // let lastBlockHeight = 0;
                // for (const [hash, xTransaction] of this._$transactions) {
                //     if (xTransaction.properties.blockHeight >= lastBlockHeight)
                //         lastBlockHeight = xTransaction.properties.blockHeight;
                //     else if (!xTransaction.properties.blockHeight)
                //         continue;
                //     else
                //         console.log("isSorted", false);
                // }
            }
        }

        if (this.properties.transactions.size === 0) {
            this.$transactionsList.textContent = '';
            const $noContent = XNoTransactions.createElement();
            this.$transactionsList.appendChild($noContent.$el);
        }

        if (this.properties.totalTransactionCount <= 4) {
            this.$el.classList.add('few-transactions');
        } else {
            this.$el.classList.remove('few-transactions');
        }

        const number = this.properties.numberUnclaimedCashlinks;
        this.$filterUnclaimedCashlinks.classList.toggle('display-none', number < 1);
        this.$filterUnclaimedCashlinks.textContent = `${number} unclaimed Cashlink${number !== 1 ? 's' : ''}`;

        this.$el.classList.toggle('filtered', this.properties.filterUnclaimedCashlinks);
    }

    /**
     * @param {string[]} [addresses]
     */
    async requestTransactionHistory(addresses) {
        if (!this.properties.hasAccounts) return;
        if (Config.offline) {
            this.actions.addTransactions([]);
            return;
        }

        this.actions.setRequestingHistory(true);
        addresses = addresses || this.properties.addresses;
        const { newTransactions, removedTransactions } = await this._requestTransactionHistory(addresses);
        this.actions.addTransactions(newTransactions);
        // this.actions.markRemoved(removedTransactions, this.properties.lastKnownHeight);
        this.actions.setRequestingHistory(false);
    }

    /**
     * @param {object} tx
     */
    addTransaction(tx) {
        this._$transactions.set(tx.hash, this._createTransaction(tx));
    }

    _createTransaction(transaction) {
        const $transaction = new XTransaction(document.createElement('tr'));

        $transaction.transaction = transaction;

        // FIXME: Use `prepend` when Edge supports it
        this.$transactionsList.insertBefore($transaction.$el, this.$transactionsList.firstChild || null);

        return $transaction;
    }

    _onTransactionSelected(hash) {
        hash = encodeURIComponent(hash);
        XTransactionModal.show(hash);
    }

    async _requestTransactionHistory(addresses) {
        const knownReceipts = this._generateKnownReceipts();

        // TODO: only ask from knownLastHeight when this function is called at app start,
        // not when requesting txs after a new account has been added!
        // const height = this.properties.lastKnownHeight - 10;
        const height = 0;

        return (await networkClient.client).requestTransactionHistory(addresses, knownReceipts, height);
    }

    _generateKnownReceipts() {
        // Create an empty map of knownReceipts
        const knownReceipts = new Map();

        for (const [hash, tx] of MixinRedux.store.getState().transactions.entries) {
            if (tx.removed || tx.expired) continue;
            knownReceipts.set(hash, tx.blockHash);
        }
        return knownReceipts;
    }

    _onViewMore() {
        this.actions.setItemsPerPage(10);
        this.$el.classList.add('view-more');
    }

    _onViewLess() {
        this.actions.setPage(1);
        this.actions.setItemsPerPage(4);
        this.$el.classList.remove('view-more');
    }

    _toggleFilterUnclaimedCashlinks() {
        this.actions.setFilterUnclaimedCashlinks(!this.properties.filterUnclaimedCashlinks);
    }
}
