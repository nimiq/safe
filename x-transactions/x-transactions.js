import XElement from '/libraries/x-element/x-element.js';
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js';
import XTransaction from './x-transaction.js';
import XTransactionModal from './x-transaction-modal.js';
import XNoTransactions from './x-no-transactions.js';
import XPaginator from '/elements/x-paginator/x-paginator.js';
import { addTransactions, markRemoved, setRequestingHistory, setPage, setItemsPerPage } from './transactions-redux.js';
import networkClient from '/apps/safe/src/network-client.js';
import XPopupMenu from '/elements/x-popup-menu/x-popup-menu.js';
import Config from '/libraries/secure-utils/config/config.js';
import AddressBook from '/libraries/nimiq-utils/address-book/address-book.js';
import { activeTransactions$ } from '../../apps/safe/src/selectors/transaction$.js';

export default class XTransactions extends MixinRedux(XElement) {
    html() {
        return `
            <x-popup-menu x-main-action-only x-loading-tooltip="Refreshing transaction history" x-icon="refresh" class="refresh">
            </x-popup-menu>
            <x-transactions-list>
                <x-loading-animation></x-loading-animation>
                <h2>Loading transactions...</h2>
            </x-transactions-list>
            <x-paginator store-path="transactions"></x-paginator>
            <a secondary class="view-more">View more</a>
            <a secondary class="view-less">View less</a>
        `
    }

    children() { return [ XPopupMenu, XPaginator ] }

    onCreate() {
        this._$transactions = new Map();
        this.$transactionsList = this.$('x-transactions-list');
        this.properties.onlyRecent = !!this.attributes.onlyRecent;
        this.$popupMenu.noMenu = this.attributes.noMenu;
        super.onCreate();
    }

    listeners() {
        return {
            'x-transaction-selected': this._onTransactionSelected,
            'click .refresh button': () => this.requestTransactionHistory(),
            'click .view-more': this._onViewMore,
            'click .view-less': this._onViewLess,
        }
    }

    static get actions() { return { addTransactions, markRemoved, setRequestingHistory, setPage, setItemsPerPage } }

    static mapStateToProps(state, props) {
        return {
            transactions: XTransactions._labelTransactions(
                XPaginator.getPagedItems(
                    activeTransactions$(state) || new Map(),
                    state.transactions.page,
                    state.transactions.itemsPerPage,
                    true
                ),
                state.wallets.accounts ? state.wallets.accounts : false,
                state.contacts
            ),
            hasTransactions: state.transactions.hasContent,
            totalTransactionCount: (activeTransactions$(state) || new Map()).size,
            addresses: state.wallets.accounts ? [...state.wallets.accounts.keys()] : [],
            hasAccounts: state.wallets.hasContent,
            lastKnownHeight: state.network.height || state.network.oldHeight,
            isRequestingHistory: state.transactions.isRequestingHistory
        }
    }

    static _labelTransactions(txs, accounts, contacts) {
        if (!accounts) return txs;
        txs.forEach(tx => {
            const sender = accounts.get(tx.sender);
            const recipient = accounts.get(tx.recipient);

            tx.senderLabel = sender ?
                sender.label :
                contacts[tx.sender] ?
                    contacts[tx.sender].label :
                    AddressBook.getLabel(tx.sender) || tx.sender.slice(0, 14) + '...';

            tx.recipientLabel = recipient ?
                recipient.label :
                contacts[tx.recipient] ?
                    contacts[tx.recipient].label :
                    AddressBook.getLabel(tx.recipient) || tx.recipient.slice(0, 14) + '...';

            if (sender) tx.type = 'outgoing';
            if (recipient) tx.type = 'incoming';
            if (sender && recipient) tx.type = 'transfer';
        });

        return txs;
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

        if (changes.transactions) {
            if (this.$('x-loading-animation') || this.$('x-no-transactions')) {
                this.$transactionsList.textContent = '';
            }

            // Transaction-internal updates are handled by the XTransaction
            // elements themselves, so we only need to handle reordering and
            // removed tx here.

            // Check if the changes include a new hash or a
            // blockHeight, which would make sorting necessary
            let needsSorting = false;

            let removedTx = [];

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
        this.actions.markRemoved(removedTransactions, this.properties.lastKnownHeight);
        this.actions.setRequestingHistory(false);
    }

    /**
     * @param {object} tx
     */
    addTransaction(tx) {
        this._$transactions.set(tx.hash, this._createTransaction(tx));
    }

    _createTransaction(transaction) {
        const $transaction = XTransaction.createElement();

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
        const knownReceipts = this._generateKnownReceipts(addresses);

        // TODO: only ask from knownLastHeight when this function is called at app start,
        // not when requesting txs after a new account has been added!
        // const height = this.properties.lastKnownHeight - 10;
        const height = 0;

        return (await networkClient.client).requestTransactionHistory(addresses, knownReceipts, height);
    }

    _generateKnownReceipts(addresses) {
        // Create an emtpy map of knownReceiptsbyAddress
        const knownReceipts = new Map(addresses.map(a => [a, new Map()]));

        for (const [hash, tx] of MixinRedux.store.getState().transactions.entries) {
            if (tx.removed || tx.expired) continue;

            if (knownReceipts.has(tx.sender)) {
                knownReceipts.get(tx.sender).set(hash, tx.blockHash);
            }

            if (knownReceipts.has(tx.recipient)) {
                knownReceipts.get(tx.recipient).set(hash, tx.blockHash);
            }
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
}
