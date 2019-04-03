import { createSelector } from '/libraries/reselect/src/index.js';

import { accountsArray$ } from './account$.js';

import AccountType from '../lib/account-type.js';

export const walletAccounts$ = createSelector(
    accountsArray$,
    accounts => accounts && accounts.filter(x => x.type === AccountType.KEYGUARD_LOW)
);

export const upgradeableAccount$ = createSelector(
    walletAccounts$,
    accounts => accounts.length > 0 && accounts[0]
);

export default createSelector(
    walletAccounts$,
    accounts => accounts && accounts.find(x => x.balance > 0)
);
