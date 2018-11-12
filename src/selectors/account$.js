import { createSelector } from '/libraries/reselect/src/index.js';

import { activeWalletId$ } from './wallet$.js';
import { LEGACY } from '../wallet-redux.js';

export const accounts$ = state => state.accounts.entries;

export const hasContent$ = state => state.accounts.hasContent;

export const activeAccounts$ = createSelector(
    accounts$,
    hasContent$,
    activeWalletId$,
    (accounts, hasContent, activeWalletId) => hasContent && new Map([...accounts.entries()].filter(entry => {
        const account = entry[1];
        if (activeWalletId === LEGACY) return account.isLegacy;
        return account.keyId === activeWalletId;
    }))
);

export const accountsArray$ = createSelector(
    accounts$,
    hasContent$,
    activeWalletId$,
    (accounts, hasContent, activeWalletId) => hasContent && [...accounts.values()].filter(acc => {
        if (activeWalletId === LEGACY) return acc.isLegacy;
        return acc.keyId === activeWalletId;
    })
);

export const activeAddresses$ = createSelector(
    accountsArray$,
    (accounts) => accounts && accounts.map(acc => acc.address)
);

export const balancesLoaded$ = createSelector(
    accountsArray$,
    accounts => {
        if (!accounts) return false;

        if (accounts.filter(x => x.balance === undefined).length > 0) return false;

        return true;
    }
);
