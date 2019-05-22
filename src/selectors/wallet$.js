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
            activeAddressInfo: walletAccounts.find(account => account.address === wallet.activeAddress),
            balance: calculateTotalBalance(walletAccounts),
        });
    }).concat([])
);

export const activeWallet$ = createSelector(
    walletsArray$,
    activeWalletId$,
    (wallets, activeWalletId) => {
        if (wallets.length === 0) return null;
        return wallets.find(wallet => wallet.id === activeWalletId);
    }
);

export const activeAddressInfo$ = createSelector(
    activeWallet$,
    (wallet) => {
        return wallet && wallet.activeAddressInfo;
    }
);

export const hasNewWallet$ = createSelector(
    walletsArray$,
    (wallets) => wallets.some(wallet => wallet.type !== WalletType.LEGACY)
); 
