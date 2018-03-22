import XElement from '/libraries/x-element/x-element.js';
import MixinRedux from '/elements/mixin-redux/mixin-redux.js';
import XTransaction from './x-transaction.js';
import XTransactionModal from './x-transaction-modal.js';
import XNoContent from './x-no-content.js';
import XPaginator from '/elements/x-paginator/x-paginator.js';

export default class XTransactions extends MixinRedux(XElement) {
    html() {
        return `
            <x-transactions-list>
                <x-loading-animation></x-loading-animation>
                <h2>Loading transactions...</h2>
            </x-transactions-list>
            <x-paginator store-path="transactions"></x-paginator>
        `
    }

    children() { return [ XPaginator ] }

    onCreate() {
        this._transactions = new Map();
        this.$transactionsList = this.$('x-transactions-list');
        super.onCreate();
    }

    listeners() {
        return {
            'x-transaction-selected': this._onTransactionSelected
        }
    }

    static mapStateToProps(state) {
        return {
            transactions: XTransactions._labelTransactions(
                XPaginator.getPagedItems(
                    state.transactions.entries,
                    state.transactions.page,
                    state.transactions.itemsPerPage,
                    true
                ),
                state.accounts.entries
            ),
            hasContent: state.transactions.hasContent,
            totalPages: Math.ceil(state.transactions.entries.size / state.transactions.txsPerPage)
        }
    }

    static _labelTransactions(txs, accounts) {
        txs.forEach(tx => {
            const sender = accounts.get(tx.sender);
            const recipient = accounts.get(tx.recipient);

            tx.senderLabel = sender ? sender.label : tx.sender.slice(0, 9) + '...';
            tx.recipientLabel = recipient ? recipient.label : tx.recipient.slice(0, 9) + '...';

            tx.type = sender && recipient ? 'transfer' : sender ? 'outgoing' : 'incoming';
        });

        return txs;
    }

    _onPropertiesChanged(changes) {
        const { hasContent, transactions } = this.properties;

        if (!hasContent) return;

        if (changes.transactions) {
            if (this.$('x-loading-animation') || this.$('x-no-content')) {
                this.$transactionsList.textContent = '';
            }

            for (const [hash, transaction] of changes.transactions) {
                const $transaction = this._transactions.get(hash);
                if (transaction === undefined) {
                    // todo test!
                    $transaction && $transaction.destroy();
                    this._transactions.delete(hash);
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
        this._transactions.set(tx.hash, this._createTransaction(tx));
    }

    _createTransaction(transaction) {
        const $transaction = XTransaction.createElement();

        $transaction.transaction = transaction;

        // FIXME: Use `prepend` when Edge supports it
        this.$transactionsList.insertBefore($transaction.$el, this.$transactionsList.firstChild || null);

        return $transaction;
    }

    _onTransactionSelected(transaction) {
        XTransactionModal.instance.transaction = transaction;
        XTransactionModal.show();
    }
}
