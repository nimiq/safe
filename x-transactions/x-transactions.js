import XElement from '/libraries/x-element/x-element.js';
import XTransaction from './x-transaction.js';
import reduxify from '/libraries/redux/src/redux-x-element.js';
import store from '/apps/safe/store/store.js';

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
        if (changes.transactions) {
            if (this.$('x-loading-animation')) {
                this.$transactionsList.textContent = '';
            }

            for (const [hash, transaction] of changes.transactions) {
                if (transaction === undefined) {
                    // todo test!
                    const { element } = this._transactions.get(hash);
                    element.destroy();
                    this._transactions.delete(hash);
                } else {
                    this.addTransaction(transaction);
                }
            }
        }
    }

    /**
     * @param {object} tx
     */
    addTransaction(tx) {
        this._transactions.set(tx.hash, { tx, element: this._createTransaction(tx)});
    }

    _createTransaction(tx) {
        const $transaction = reduxify(
            store,
            state => {
                const entry = state.transactions.entries.get(tx.hash);
                return {
                    blockHeight: entry.blockHeight,
                    timestamp: entry.timestamp
                };
            }
        )(XTransaction).createElement();

        $transaction.setProperties({
            ...tx
        });

        this.$transactionsList.appendChild($transaction.$el);

        return $transaction;
    }
}
