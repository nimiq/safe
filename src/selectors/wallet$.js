import { createSelector } from '/libraries/reselect/src/index.js';

const LEGACY_ID = 'LEGACY';
const LEGACY_LABEL = 'Single-Account Wallets';

export const wallets$ = state => state.wallets.entries;

export const hasContent$ = state => state.wallets.hasContent;

export const activeWalletId$ = state => state.wallets.activeWalletId;

const accountsArray$ = state => [...state.accounts.entries.values()];

export const walletsArray$ = createSelector(
    wallets$,
    hasContent$,
    accountsArray$,
    (wallets, hasContent, accounts) => hasContent && [...wallets.values()].map(wallet => {
        wallet.balance = accounts
            .filter(acc => acc.walletId === wallet.id)
            .reduce((sum, account) => sum + account.balance * 1e5, 0)
        return wallet
    })
);

export const activeWallet$ = createSelector(
    wallets$,
    activeWalletId$,
    (wallets, activeWalletId) => {
        if (activeWalletId === LEGACY_ID) return { label: LEGACY_LABEL }
        return wallets.get(activeWalletId)
    }
);
