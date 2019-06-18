import { createSelector } from 'reselect';
import { WalletType } from '../redux/wallet-redux.js';
import { accountsArray$ } from './account$.js';

export const wallets$ = state => state.wallets.wallets;

export const hasContent$ = state => state.wallets.hasContent;

export const activeWalletId$ = state => state.wallets.activeWalletId;

function calculateTotalBalance(accounts) {
    if (accounts.some(account => account.balance === undefined)) {
        return undefined;
    }
    return accounts.reduce((sum, account) => sum + (account.balance || 0) * 1e5, 0);
}

export const walletsArray$ = createSelector(
    wallets$,
    accountsArray$,
    (wallets, accounts) => [...wallets.values()].map(wallet => {
        const walletAccounts = accounts.filter(account => account.walletId === wallet.id);
        return Object.assign({}, wallet, {
            accounts: walletAccounts,
            balance: calculateTotalBalance(walletAccounts),
        });
    }).concat([])
);

export const activeWallet$ = createSelector(
    wallets$,
    activeWalletId$,
    (wallets, activeWalletId) => {
        if (wallets.size === 0) return null;
        return wallets.get(activeWalletId);
    }
);

export const hasNewWallet$ = createSelector(
    walletsArray$,
    (wallets) => wallets.some(wallet => wallet.type !== WalletType.LEGACY)
); 
