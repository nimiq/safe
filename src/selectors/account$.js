import { createSelector } from '/libraries/reselect/src/index.js';

export const accounts$ = state => state.accounts.entries;

export const hasContent$ = state => state.accounts.hasContent;

export const accountsArray$ = createSelector(
    accounts$,
    hasContent$,
    (accounts, hasContent) => hasContent && [...accounts.values()]
);

export const balancesLoaded$ = createSelector(
    accountsArray$,
    accounts => {
        if (!accounts) return false;

        if (accounts.filter(x => x.balance === undefined).length > 0) return false;

        return true;
    }
);