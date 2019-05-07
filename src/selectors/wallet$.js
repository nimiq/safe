import { createSelector } from '/libraries/reselect/src/index.js';
import { LEGACY, WalletType } from '../wallet-redux.js';
import { legacyAccounts$, accountsArray$ } from './account$.js';

const LEGACY_LABEL = 'Single-Address Accounts';

export const wallets$ = state => state.wallets.wallets;

export const hasContent$ = state => state.wallets.hasContent;

export const activeWalletId$ = state => state.wallets.activeWalletId;

function calculateTotalBalance(accounts) {
    if (accounts.some(account => account.balance === undefined)) {
        return undefined;
    }
    return accounts.reduce((sum, account) => sum + (account.balance || 0) * 1e5, 0);
}

export const legacyWallet$ = createSelector(
    legacyAccounts$,
    (accounts) => accounts.length > 0 ? ({
        id: LEGACY,
        balance: calculateTotalBalance(accounts),
        accounts,
        label: LEGACY_LABEL,
        type: WalletType.LEGACY,
    }) : undefined
);

export const walletsArray$ = createSelector(
    wallets$,
    legacyWallet$,
    hasContent$,
    accountsArray$,
    (wallets, legacyWallet, hasContent, accounts) => (hasContent ? [...wallets.values()].map(wallet => {
        const walletAccounts = accounts.filter(account => account.walletId === wallet.id);
        wallet.accounts = walletAccounts;
        wallet.balance = calculateTotalBalance(walletAccounts);
        return wallet;
    }) : []).concat(legacyWallet || [])
);

export const activeWallet$ = createSelector(
    wallets$,
    legacyWallet$,
    activeWalletId$,
    (wallets, legacyWallet, activeWalletId) => {
        if (activeWalletId === LEGACY) return legacyWallet;
        if (wallets.size === 0) return null;
        return wallets.get(activeWalletId);
    }
);
