import { createSelector } from '/libraries/reselect/src/index.js';
import { WalletType } from '../wallet-redux.js';

const LEGACY_ID = 'LEGACY';
const LEGACY_LABEL = 'Single-Address Accounts';

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
            .reduce((sum, account) => sum + (account.balance || 0) * 1e5, 0);
        wallet.numberAccounts = wallet.id === LEGACY_ID ? 1 : accounts.filter(acc => acc.walletId  === wallet.id).length;
        return wallet;
    })
);

export const activeWallet$ = createSelector(
    wallets$,
    activeWalletId$,
    (wallets, activeWalletId) => {
        if (activeWalletId === LEGACY_ID) {
            return {
            id: LEGACY_ID,
            label: LEGACY_LABEL,
            };
        }
        return wallets.get(activeWalletId);
    }
);
