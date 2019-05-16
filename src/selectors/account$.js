import { createSelector } from '../lib/reselect/src/index.js';

import AccountType from '../lib/account-type.js';

const simpleAccounts$ = state => state.wallets.accounts;

export const hasContent$ = state => state.wallets.hasContent;

const activeWalletId$ = state => state.wallets.activeWalletId;

const height$ = state => state.network.height || state.network.oldHeight;

export const accounts$ = createSelector(
    simpleAccounts$,
    height$,
    (simpleAccounts, height) => {
        const accounts = new Map(simpleAccounts);
        if (!height) return accounts;
        for (const account of accounts.values()) {
            if (account.type !== AccountType.VESTING || !account.balance) continue;
            const newAccount = Object.assign({}, account);

            // calculate and add steps and available balance
            const steps = [];
            const numberSteps = Math.ceil(account.totalAmount / account.stepAmount);

            for (let i = 1; i <= numberSteps; i++) {
                const stepHeight = account.start + account.stepBlocks * i;
                const stepHeightDelta = stepHeight - height;
                steps.push({
                    height: stepHeight,
                    heightDelta: stepHeightDelta,
                    amount: i < numberSteps ? account.stepAmount : account.totalAmount - account.stepAmount * (i - 1),
                });
            }

            newAccount.pastSteps = steps.filter(step => step.heightDelta <= 0);
            newAccount.balance = (account.balance - account.totalAmount) + newAccount.pastSteps.reduce((acc, step) => acc + step.amount, 0);
            newAccount.futureSteps = steps.filter(step => step.heightDelta > 0);

            accounts.set(account.address, newAccount);
        }
        return accounts;
    }
);

export const accountsArray$ = createSelector(
    accounts$,
    (accounts) => [...accounts.values()]
);

export const activeAccounts$ = createSelector(
    accounts$,
    activeWalletId$,
    (accounts, activeWalletId) => new Map([...accounts.entries()].filter(entry => {
        const account = entry[1];
        return account.walletId === activeWalletId;
    }))
);

export const activeAccountsArray$ = createSelector(
    activeAccounts$,
    (activeAccounts) => [...activeAccounts.values()]
);

export const activeAddresses$ = createSelector(
    activeAccountsArray$,
    (accounts) => accounts && accounts.map(acc => acc.address)
);

export const balancesLoaded$ = createSelector(
    activeAccountsArray$,
    accounts => {
        if (!accounts) return false;

        if (accounts.filter(x => x.balance === undefined).length > 0) return false;

        return true;
    }
);
