import { createSelector } from '/libraries/reselect/src/index.js';

import { accountsArray$, balancesLoaded$ } from './account$.js';

export default createSelector(
    accountsArray$,
    balancesLoaded$,
    (accounts, balancesLoaded) => {
        if (!balancesLoaded) return undefined;

        if (accounts.length === 0) return 0;

        return accounts.reduce((acc, account) => acc + account.balance, 0);
    }
);
