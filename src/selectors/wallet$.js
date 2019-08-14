import { createSelector } from '../lib/reselect/src/index.js';
import { WalletType } from '../wallet-redux.js';
import { accountsArray$, activeAccountsArray$ } from './account$.js';
import AccountType from '../lib/account-type.js';

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
        const walletAccounts = accounts.filter(account => account.walletId === wallet.id && account.type !== AccountType.CASHLINK);
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

export const activeWalletWithAccountMap$ = createSelector(
    activeWallet$,
    activeAccountsArray$,
    (wallet, accounts) => {
        return Object.assign({}, wallet, {
            accounts: new Map(accounts.map(account => [
                account.address,
                Object.assign({}, account, {
                    userFriendlyAddress: account.address,
                    balance: account.balance ? account.balance * 1e5 : 0,
                }),
            ])),
            contracts: [],
        });
    }
);

export const hasNewWallet$ = createSelector(
    walletsArray$,
    (wallets) => wallets.some(wallet => wallet.type !== WalletType.LEGACY)
);
