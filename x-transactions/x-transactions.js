import XElement from '/libraries/x-element/x-element.js';
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js';
import XTransaction from './x-transaction.js';
import XTransactionModal from './x-transaction-modal.js';
import XNoContent from './x-no-content.js';
import XPaginator from '/elements/x-paginator/x-paginator.js';
import { addTransactions, removeTransactions, setRequestingHistory } from './transactions-redux.js';
import networkClient from '/apps/safe/src/network-client.js';
import XPopupMenu from '/elements/x-popup-menu/x-popup-menu.js';

export default class XTransactions extends MixinRedux(XElement) {
    html() {
        return `
            <x-popup-menu>
                <button refresh><i class="material-icons">refresh</i> Refresh</button>
            </x-popup-menu>
            <x-transactions-list>
                <x-loading-animation></x-loading-animation>
                <h2>Loading transactions...</h2>
            </x-transactions-list>
            <x-paginator store-path="transactions"></x-paginator>
            <a secondary x-href="history" class="display-none">View more</a>
        `
    }

    children() { return [ XPopupMenu, XPaginator ] }

    onCreate() {
        this._$transactions = new Map();
        this.$transactionsList = this.$('x-transactions-list');
        this.properties.onlyRecent = !!this.attributes.onlyRecent;
        if (this.properties.onlyRecent) {
            this.$paginator.$el.classList.add('display-none');
            this.$('a[secondary]').classList.remove('display-none');
        }
        this.$popupMenu.noMenu = this.attributes.noMenu;
        super.onCreate();
    }

    listeners() {
        return {
            'x-transaction-selected': this._onTransactionSelected,
            'click button[refresh]': () => this.requestTransactionHistory()
        }
    }

    static get actions() { return { addTransactions, removeTransactions, setRequestingHistory } }

    static mapStateToProps(state, props) {
        return {
            transactions: XTransactions._labelTransactions(
                XPaginator.getPagedItems(
                    state.transactions.entries,
                    props.onlyRecent ? 1 : state.transactions.page,
                    props.onlyRecent ? 4 : state.transactions.itemsPerPage,
                    true
                ),
                state.accounts ? state.accounts.entries : false
            ),
            hasTransactions: state.transactions.hasContent,
            addresses: state.accounts ? [...state.accounts.entries.keys()] : [],
            hasAccounts: state.accounts.hasContent,
            lastKnownHeight: state.network.height || state.network.oldHeight,
            isRequestingHistory: state.transactions.isRequestingHistory
        }
    }

    static _labelTransactions(txs, accounts) {
        if (!accounts) return txs;
        txs.forEach(tx => {
            const sender = accounts.get(tx.sender);
            const recipient = accounts.get(tx.recipient);

            tx.senderLabel = sender ? sender.label : tx.sender.slice(0, 14) + '...';
            tx.recipientLabel = recipient ? recipient.label : tx.recipient.slice(0, 14) + '...';

            tx.type = sender && recipient
                    ? 'transfer'
                        : sender
                        ? 'outgoing'
                            : recipient
                            ? 'incoming'
                                : '';
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
                const newAddresses = Object.values(changes.addresses);
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

        const { hasTransactions, transactions } = this.properties;

        if (!hasTransactions) return;

        if (changes.transactions) {
            if (this.$('x-loading-animation') || this.$('x-no-content')) {
                this.$transactionsList.textContent = '';
            }

            for (const [hash, transaction] of changes.transactions) {
                const $transaction = this._$transactions.get(hash);
                // FIXME/TODO Instead of deleting existing elements and re-creating new ones, why not re-use the existing ones?
                if (transaction === undefined) {
                    $transaction && $transaction.destroy();
                    this._$transactions.delete(hash);
                } else if (!$transaction) {
                    // new entry
                    this.addTransaction(transaction);
                }
            }
        }

        if (transactions.size === 0) {
            this.$transactionsList.textContent = '';
            const $noContent = XNoContent.createElement();
            this.$transactionsList.appendChild($noContent.$el);
        }
    }

    /**
     * @param {string[]} [addresses]
     */
    async requestTransactionHistory(addresses) {
        if (!this.properties.hasAccounts) return;

        this.actions.setRequestingHistory(true);
        addresses = addresses || this.properties.addresses;
        const { newTransactions, removedTransactions } = await this._requestTransactionHistory(addresses);
        this.actions.addTransactions(newTransactions);
        this.actions.removeTransactions(removedTransactions, this.properties.lastKnownHeight);
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

        return (await networkClient).rpcClient.requestTransactionHistory(addresses, knownReceipts, height);
    }

    _generateKnownReceipts(addresses) {
        const knownReceipts = new Map(addresses.map(a => [a, new Map()]));

        for (const [hash, tx] of MixinRedux.store.getState().transactions.entries) {
            if (knownReceipts.has(tx.sender)) {
                knownReceipts.get(tx.sender).set(hash, tx.blockHash);
            }

            if (knownReceipts.has(tx.recipient)) {
                knownReceipts.get(tx.recipient).set(hash, tx.blockHash);
            }
        }
        return knownReceipts;
    }
}
