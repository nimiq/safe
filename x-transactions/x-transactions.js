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
            <button refresh class="small secondary" title="Refresh transactions">
                <span text>
                    <i class="material-icons">refresh</i>
                    <span hide-sm> Refresh</span>
                </span>
                <span class="dot-loader display-none"></span>
            </button>
            <x-transactions-list>
                <x-loading-animation></x-loading-animation>
                <h2>Loading transactions...</h2>
            </x-transactions-list>
            <x-paginator store-path="transactions"></x-paginator>
            <a secondary x-href="transactions" class="display-none">View more</a>
        `
    }

    children() { return [ XPaginator ] }

    onCreate() {
        this._$transactions = new Map();
        this.$transactionsList = this.$('x-transactions-list');
        this.$refresh = this.$('button[refresh]');
        this.$refreshText = this.$('span[text]');
        this.$refreshLoader = this.$('span.dot-loader');
        this.properties.onlyRecent = !!this.attributes.onlyRecent;
        if (this.properties.onlyRecent) {
            this.$paginator.$el.classList.add('display-none');
            this.$('a[secondary]').classList.remove('display-none');
        }
        super.onCreate();
    }

    listeners() {
        return {
            'x-transaction-selected': this._onTransactionSelected,
            'click button[refresh]': () => this.requestTransactionHistory()
        }
    }

    static get actions() { return { addTransactions } }

    static mapStateToProps(state, props) {
        return {
            transactions: XTransactions._labelTransactions(
                XPaginator.getPagedItems(
                    state.transactions.entries,
                    props.onlyRecent ? 1 : state.transactions.page,
                    props.onlyRecent ? 5 : state.transactions.itemsPerPage,
                    true
                ),
                state.accounts ? state.accounts.entries : false
            ),
            hasTransactions: state.transactions.hasContent,
            addresses: state.accounts ? [...state.accounts.entries.keys()] : [],
            hasAccounts: state.accounts.hasContent,
            lastKnownHeight: state.network.height || state.network.oldHeight
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
        if (changes.hasAccounts && !this.properties.addresses.length) {
            // Empty state
            this.actions.addTransactions([]);
        }
        else if (changes.addresses && !(changes.addresses instanceof Array)) {
            const newAddresses = Object.values(changes.addresses);
            // console.log("ADDRESSES CHANGED, REQUESTING TX HISTORY FOR", newAddresses);
            // Request transaction history for new accounts
            this.requestTransactionHistory(newAddresses);
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

        this._buttonShowLoader();
        addresses = addresses || this.properties.addresses;
        const transactions = await this._requestTransactionHistory(addresses);
        transactions.length && this.actions.addTransactions(transactions);
        this._buttonShowText();
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

        const height = this.properties.lastKnownHeight - 10;

        return (await networkClient).rpcClient.requestTransactionHistory(addresses, knownReceipts, height);
    }

    _generateKnownReceipts() {
        const knownReceipts = new Map();
        for (const [hash, tx] of MixinRedux.store.getState().transactions.entries) {
            knownReceipts.set(hash, tx.blockHash);
        }
        return knownReceipts;
    }

    _buttonShowLoader() {
        this.$refreshText.classList.add('display-none');
        this.$refreshLoader.classList.remove('display-none');
        this.$refresh.disabled = true;
    }

    _buttonShowText() {
        this.$refreshText.classList.remove('display-none');
        this.$refreshLoader.classList.add('display-none');
        this.$refresh.disabled = false;
    }
}
