import { createSelector } from '/libraries/reselect/src/index.js';

const accounts$ = state => state.accounts.entries;

const hasContent$ = state => state.accounts.hasContent;

const accountsArray$ = createSelector(
    accounts$,
    hasContent$,
    (accounts, hasContent) => hasContent && [...accounts.values()]
);

const balancesLoaded$ = createSelector(
    accountsArray$,
    accounts => {
        if (!accounts) return false;

        if (accounts.filter(x => x.balance === undefined).length > 0) return false;

        return true;
    }
);

export default createSelector(
    accountsArray$,
    balancesLoaded$,
    (accounts, balancesLoaded) => {
        if (!balancesLoaded) return null;

        if (accounts.length === 0) return 0;

        return accounts.reduce((acc, account) => acc + account.balance, 0);
    }
);
