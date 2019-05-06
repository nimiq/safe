import { createSelector } from '/libraries/reselect/src/index.js';

import { LEGACY } from '../wallet-redux.js';
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

export const activeAccounts$ = createSelector(
    accounts$,
    hasContent$,
    activeWalletId$,
    (accounts, hasContent, activeWalletId) => hasContent && new Map([...accounts.entries()].filter(entry => {
        const account = entry[1];
        if (activeWalletId === LEGACY) return account.isLegacy;
        return account.walletId === activeWalletId;
    }))
);

export const accountsArray$ = createSelector(
    accounts$,
    hasContent$,
    activeWalletId$,
    (accounts, hasContent, activeWalletId) => hasContent && [...accounts.values()].filter(acc => {
        if (activeWalletId === LEGACY) return acc.isLegacy;
        return acc.walletId === activeWalletId;
    })
);

export const legacyAccounts$ = createSelector(
    accounts$,
    hasContent$,
    (accounts, hasContent) => hasContent ? [...accounts.values()].filter(account => account.isLegacy) : []
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
