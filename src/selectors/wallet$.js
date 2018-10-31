import { createSelector } from '/libraries/reselect/src/index.js';

const LEGACY_ID = 'LEGACY';
const LEGACY_LABEL = 'Single-Account Wallets';

export const wallets$ = state => state.wallets.entries;

export const hasContent$ = state => state.wallets.hasContent;

export const walletsArray$ = createSelector(
    wallets$,
    hasContent$,
    (wallets, hasContent) => hasContent && [...wallets.values()]
);

export const activeWalletId$ = state => state.wallets.activeKeyId;

export const activeWallet$ = createSelector(
    wallets$,
    activeWalletId$,
    (wallets, activeWalletId) => {
        if (activeWalletId === LEGACY_ID) return { label: LEGACY_LABEL }
        return wallets.get(activeWalletId)
    }
);
