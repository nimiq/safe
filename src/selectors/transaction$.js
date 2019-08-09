import { createSelector } from '../lib/reselect/src/index.js';

import { activeAccounts$ } from './account$.js';
import { activeCashlinks$ } from './cashlink$.js';
import { CashlinkStatus } from '../cashlink-redux.js';

export const transactions$ = state => state.transactions.entries;

export const hasContent$ = state => state.transactions.hasContent;

export const filterUnclaimedCashlinks$ = state => state.transactions.filterUnclaimedCashlinks;

export const activeTransactions$ = createSelector(
    transactions$,
    hasContent$,
    activeAccounts$,
    activeCashlinks$,
    filterUnclaimedCashlinks$,
    (transactions, hasContent, accounts, cashlinks, filterUnclaimed) => hasContent && new Map([...transactions.entries()]
        .filter(entry => {
            const tx = entry[1];
            if (!accounts.has(tx.sender) && !accounts.has(tx.recipient) &&
                !cashlinks.has(tx.sender) && !cashlinks.has(tx.recipient)) return false;
            if (filterUnclaimed) {
                if (tx.isCashlink !== 'funding') return false;
                const cashlink = cashlinks.get(tx.recipient);
                return cashlink && cashlink.status <= CashlinkStatus.UNCLAIMED;
            }
            return true;
        }))
);

const typedTransactions$ = createSelector(
    activeTransactions$,
    activeAccounts$,
    transactions$,
    (txs, accounts, txStore) => {
        if (!accounts) return txs;
        return txs && new Map([...txs.entries()].map(entry => {
            const tx = entry[1];
            const sender = accounts.get(tx.sender);
            const recipient = accounts.get(tx.recipient);

            // 1. Detect tx type

            if (tx.isCashlink === 'claiming' && !recipient) {
                // This is the tx where the final recipient claimed our outgoing cashlink.
                // It will be displayed as an info bar only.
                tx.type = 'cashlink_remote_claim';

                if (!tx.pairedTx) {
                    // Search for our cashlink funding tx
                    const pairedTx = [...txStore.values()].find(
                        storedTx => storedTx.recipient === tx.sender && storedTx.isCashlink === 'funding');
                    if (pairedTx) {
                        tx.pairedTx = Object.assign({}, pairedTx);
                    }
                }
            }
            else if (tx.isCashlink === 'claiming' && recipient) {
                // This tx is where we ourselves claimed a cashlink.
                // This will be displayed as a special cashlink-claiming tx, matched to a
                // 'cashlink_remote_fund' tx.
                tx.type = 'incoming';

                if (!tx.pairedTx) {
                    // Search for the original (remote) funding tx
                    const pairedTx = [...txStore.values()].find(
                        storedTx => storedTx.recipient === tx.sender && storedTx.isCashlink === 'funding');
                    if (pairedTx) {
                        tx.pairedTx = Object.assign({}, pairedTx);
                    }
                }
            }
            else if (tx.isCashlink === 'funding' && !sender) {
                // This tx is the original funding tx of a cashlink that we claimed.
                // This tx is only relevant to provide the originalSender for incoming cashlinks.
                tx.type = 'cashlink_remote_fund'; // This type is hidden from the list
            }
            else if (tx.isCashlink === 'funding' && sender) {
                // This is the funding tx for a cashlink which we sent ourselves.
                tx.type = 'outgoing';

                if (!tx.pairedTx) {
                    // Search for final recipient tx
                    const pairedTx = [...txStore.values()].find(
                        storedTx => storedTx.sender === tx.recipient && storedTx.isCashlink === 'claiming');
                    if (pairedTx) {
                        tx.pairedTx = Object.assign({}, pairedTx);
                    }
                }
            }
            else if (sender && recipient) tx.type = 'transfer';
            else if (sender) tx.type = 'outgoing';
            else if (recipient) tx.type = 'incoming';

            return entry;
        }));
    }
);

export const relevantTransactions$ = createSelector(
    typedTransactions$,
    (txs) => txs && new Map([...txs.entries()].filter(entry => entry[1].type !== 'cashlink_remote_fund'))
);
