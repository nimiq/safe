import { createSelector } from '/libraries/reselect/src/index.js';

export const wallets$ = state => state.wallets.entries;

export const hasContent$ = state => state.wallets.hasContent;

export const walletsArray$ = createSelector(
    wallets$,
    hasContent$,
    (wallets, hasContent) => hasContent && [...wallets.values()]
);

export const activeWalletId$ = state => state.wallets.activeKeyId;
