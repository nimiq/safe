import { createSelector } from '../lib/reselect/src/index.js';

import { activeAccounts$ } from './account$.js';

export const transactions$ = state => state.transactions.entries;

export const hasContent$ = state => state.transactions.hasContent;

export const filterUnclaimedCashlinks$ = state => state.transactions.filterUnclaimedCashlinks;

export const activeTransactions$ = createSelector(
    transactions$,
    hasContent$,
    activeAccounts$,
    filterUnclaimedCashlinks$,
    (transactions, hasContent, accounts, filterUnclaimed) => hasContent && new Map([...transactions.entries()].filter(entry => {
        const tx = entry[1];
        if (!accounts.has(tx.sender) && !accounts.has(tx.recipient)) return false;
        if (filterUnclaimed) {
            if (tx.isCashlink !== 'funding') return false;
            const cashlinkAccount = accounts.get(tx.recipient);
            return cashlinkAccount && !cashlinkAccount.cashlinkClaimed;
        }
        return true;
    }))
);
