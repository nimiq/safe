import { createSelector } from '../lib/reselect/src/index.js';

import { activeAccountsArray$, balancesLoaded$ } from './account$.js';
import AccountType from '../lib/account-type.js';

export default createSelector(
    activeAccountsArray$,
    balancesLoaded$,
    (accounts, balancesLoaded) => {
        if (!balancesLoaded) return undefined;

        if (accounts.length === 0) return 0;

        return accounts
            .filter(account => account.type !== AccountType.CASHLINK)
            .reduce((sum, account) => sum + account.balance, 0);
    }
);
