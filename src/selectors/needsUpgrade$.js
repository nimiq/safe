import { createSelector } from '/libraries/reselect/src/index.js';

import { accountsArray$ } from './account$.js';

import AccountType from '/libraries/account-manager/account-type.js';

const walletAccounts$ = createSelector(
    accountsArray$,
    accounts => accounts && accounts.filter(x => x.type === AccountType.KEYGUARD_LOW)
);

export default createSelector(
    walletAccounts$,
    accounts => accounts && accounts.find(x => x.balance > 0)
);
