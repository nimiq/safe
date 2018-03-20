import XElement from '/libraries/x-element/x-element.js';
import MixinRedux from '/elements/mixin-redux/mixin-redux.js';
import XTransaction from './x-transaction.js';
import XNoContent from './x-no-content.js';

export default class XTransactions extends MixinRedux(XElement) {
    html() {
        return `
            <x-transactions-list>
                <x-loading-animation></x-loading-animation>
                <h2>Loading transactions...</h2>
            </x-transactions-list>
        `
    }

    onCreate() {
        super.onCreate();
        this._transactions = new Map();
        this.$transactionsList = this.$('x-transactions-list');
    }

    static mapStateToProps(state) {
        return {
            transactions: state.transactions.entries,
            hasContent: state.transactions.hasContent,
            error: state.transactions.error
        }
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
