import { createSelector } from '/libraries/reselect/src/index.js';

import { activeAddresses$ } from './account$.js';

export const transactions$ = state => state.transactions.entries;

export const hasContent$ = state => state.transactions.hasContent;

export const activeTransactions$ = createSelector(
    transactions$,
    hasContent$,
    activeAddresses$,
    (transactions, hasContent, addresses) => hasContent && new Map([...transactions.entries()].filter(entry => {
        const tx = entry[1];
        return addresses.includes(tx.sender) || addresses.includes(tx.recipient);
    }))
);
