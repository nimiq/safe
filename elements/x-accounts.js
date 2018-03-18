import XAccounts from '/elements/x-accounts/x-accounts.js';
import reduxify from '/libraries/redux/src/redux-x-element.js';
import store from '../store/store.js'

export default reduxify(
    store,
    state => ({
        accounts: state.accounts.entries,
        hasContent: state.accounts.hasContent,
        loading: state. accounts.loading,
        error: state.accounts.error
    })
)(XAccounts)
