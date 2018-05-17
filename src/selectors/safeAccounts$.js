import { createSelector } from '/libraries/reselect/src/index.js';

import { accountsArray$ } from './account$.js';

import AccountType from '/libraries/account-manager/account-type.js';

export const safeAccounts$ = createSelector(
    accountsArray$,
    accounts => accounts && accounts.filter(x => x.type === AccountType.KEYGUARD_HIGH || x.type === AccountType.LEDGER)
);

export const safeAccountsPresent$ = createSelector(
    safeAccounts$,
    safeAccounts => safeAccounts.length > 0
);