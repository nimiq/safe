import { createSelector } from 'reselect';

import { activeAccountsArray$, balancesLoaded$ } from './account$.js';

export default createSelector(
    activeAccountsArray$,
    balancesLoaded$,
    (accounts, balancesLoaded) => {
        if (!balancesLoaded) return undefined;

        if (accounts.length === 0) return 0;

        return accounts.reduce((sum, account) => sum + account.balance, 0);
    }
);
