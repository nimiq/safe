import XElement from '/libraries/x-element/x-element.js';
import XTransaction from './x-transaction.js';
import XNoContent from './x-no-content.js';

export default class XTransactions extends XElement {
    html() {
        return `
            <x-transactions-list>
                <x-loading-animation></x-loading-animation>
                <h2>Loading transactions...</h2>
            </x-transactions-list>
        `
    }

    onCreate() {
        this._transactions = new Map();
        this.$transactionsList = this.$('x-transactions-list');
    }

    _onPropertiesChanged(changes) {
        const { hasContent, transactions } = this.properties;

        if (!hasContent) return;

        if (this.$('x-loading-animation')) {
            this.$transactionsList.textContent = '';
        }

        if (changes.transactions) {
            for (const [hash, transaction] of changes.transactions) {
                const $transaction = this._transactions.get(hash);
                if (transaction === undefined) {
                    // todo test!
                    $transaction && $transaction.destroy();
                    this._transactions.delete(hash);
                } else {
                    if ($transaction) $transaction.setProperties(transaction);
                    else this.addTransaction(transaction);
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

    _createTransaction(tx) {
        const $transaction = XTransaction.createElement();

        $transaction.setProperties({
            ...tx
        });

        this.$transactionsList.appendChild($transaction.$el);

        return $transaction;
    }
}
