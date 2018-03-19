import XTransactions from '/elements/x-transactions/x-transactions.js';
import reduxify from '/libraries/redux/src/redux-x-element.js';
import store from '../store/store.js'

export default reduxify(
    store,
    state => ({
        transactions: state.transactions.entries,
        hasContent: state.transactions.hasContent,
        error: state.transactions.error
    })
)(XTransactions)
