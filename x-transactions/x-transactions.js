import XElement from '/libraries/x-element/x-element.js';
import MixinRedux from '/elements/mixin-redux/mixin-redux.js';
import XTransaction from './x-transaction.js';
import XTransactionModal from './x-transaction-modal.js';
import XNoContent from './x-no-content.js';
import XPaginator from '/elements/x-paginator/x-paginator.js';
import { addTransactions } from './transactions-redux.js';
import networkClient from '/apps/safe/network-client.js';

export default class XTransactions extends MixinRedux(XElement) {
    html() {
        return `
            <x-transactions-list>
                <x-loading-animation></x-loading-animation>
                <h2>Loading transactions...</h2>
            </x-transactions-list>
            <x-paginator store-path="transactions"></x-paginator>
            <x-transaction-modal x-route-aside="transaction"></x-transaction-modal>
        `
    }

    children() { return [ XPaginator, XTransactionModal ] }

    onCreate() {
        this._$transactions = new Map();
        this.$transactionsList = this.$('x-transactions-list');
        super.onCreate();
    }

    listeners() {
        return {
            'x-transaction-selected': this._onTransactionSelected
        }
    }


    static get actions() { return { addTransactions } }

    static mapStateToProps(state) {
        return {
            transactions: XTransactions._labelTransactions(
                XPaginator.getPagedItems(
                    state.transactions.entries,
                    state.transactions.page,
                    state.transactions.itemsPerPage,
                    true
                ),
                state.accounts ? state.accounts.entries : false
            ),
            hasTransactions: state.transactions.hasContent,
            addresses: state.accounts ? [...state.accounts.entries.keys()] : false,
            hasAccounts: state.accounts.hasContent
        }
    }

    static _labelTransactions(txs, accounts) {
        if (!accounts) return txs;
        txs.forEach(tx => {
            const sender = accounts.get(tx.sender);
            const recipient = accounts.get(tx.recipient);

            if (!sender && !recipient) return;

            tx.senderLabel = sender ? sender.label : tx.sender.slice(0, 9) + '...';
            tx.recipientLabel = recipient ? recipient.label : tx.recipient.slice(0, 9) + '...';

            tx.type = sender && recipient ? 'transfer' : sender ? 'outgoing' : 'incoming';
        });

        return txs;
    }

    _onPropertiesChanged(changes) {
        if (changes.hasAccounts && changes.addresses instanceof Array && !changes.addresses.length) {
            // Empty state
            this.addTransactions([]);
        }
        else if (changes.addresses && !(changes.addresses instanceof Array)) {
            const newAddresses = Object.values(changes.addresses);
            // console.log("ADDRESSES CHANGED, REQUESTING TX HISTORY FOR", newAddresses);
            // Request transaction history for new accounts
            new Promise(async () => {
                // Request transaction history
                const transactions = await this._requestTransactionHistory(newAddresses);
                this.actions.addTransactions(transactions);
            });
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
        const knownReceipts = this._generateKnownReceipts();
        return (await networkClient).rpcClient.requestTransactionHistory(addresses, knownReceipts);
    }

    _generateKnownReceipts() {
        const knownReceipts = new Map();
        for (const [hash, tx] of this.properties.transactions) {
            knownReceipts.set(hash, tx.blockHash);
        }
        return knownReceipts;
    }
}
