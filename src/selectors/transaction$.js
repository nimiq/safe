import { createSelector } from '../lib/reselect/src/index.js';

import { activeAccounts$ } from './account$.js';
import { activeCashlinks$ } from './cashlink$.js';
import { CashlinkStatus, CashlinkDirection } from '../cashlink-redux.js';

export const TransactionType = {
    INCOMING: 'incoming',
    OUTGOING: 'outgoing',
    TRANSFER: 'transfer',
    CASHLINK_REMOTE_FUND: 'cashlink-remote-fund',
    CASHLINK_REMOTE_CLAIM: 'cashlink-remote-claim',
}

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
                if (tx.isCashlink !== CashlinkDirection.FUNDING) return false;
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

            if (tx.isCashlink === CashlinkDirection.CLAIMING && !recipient) {
                // This is the tx where the final recipient claimed our outgoing cashlink.
                // It will be displayed as an info bar only.
                tx.type = TransactionType.CASHLINK_REMOTE_CLAIM;

                if (!tx.pairedTx || !tx.pairedTx.blockHeight) {
                    // Search for our cashlink funding tx
                    const pairedTx = [...txStore.values()].find(
                        storedTx => storedTx.recipient === tx.sender && storedTx.isCashlink === CashlinkDirection.FUNDING);
                    if (pairedTx) {
                        tx.pairedTx = Object.assign({}, pairedTx);
                        delete tx.pairedTx.pairedTx;
                    }
                }
            }
            else if (tx.isCashlink === CashlinkDirection.CLAIMING && recipient) {
                // This tx is where we ourselves claimed a cashlink.
                // This will be displayed as a special cashlink-claiming tx, matched to a
                // 'cashlink-remote-fund' tx.
                tx.type = TransactionType.INCOMING;

                if (!tx.pairedTx || !tx.pairedTx.blockHeight) {
                    // Search for the original (remote) funding tx
                    const pairedTx = [...txStore.values()].find(
                        storedTx => storedTx.recipient === tx.sender && storedTx.isCashlink === CashlinkDirection.FUNDING);
                    if (pairedTx) {
                        tx.pairedTx = Object.assign({}, pairedTx);
                        delete tx.pairedTx.pairedTx;
                    }
                }
            }
            else if (tx.isCashlink === CashlinkDirection.FUNDING && !sender) {
                // This tx is the original funding tx of a cashlink that we claimed.
                // This tx is only relevant to provide the originalSender for incoming cashlinks.
                tx.type = TransactionType.CASHLINK_REMOTE_FUND; // This type is hidden from the list
            }
            else if (tx.isCashlink === CashlinkDirection.FUNDING && sender) {
                // This is the funding tx for a cashlink which we sent ourselves.
                tx.type = TransactionType.OUTGOING;

                if (!tx.pairedTx || !tx.pairedTx.blockHeight) {
                    // Search for final recipient tx
                    const pairedTx = [...txStore.values()].find(
                        storedTx => storedTx.sender === tx.recipient && storedTx.isCashlink === CashlinkDirection.CLAIMING);
                    if (pairedTx) {
                        tx.pairedTx = Object.assign({}, pairedTx);
                        delete tx.pairedTx.pairedTx;
                    }
                }
            }
            else if (sender && recipient) tx.type = TransactionType.TRANSFER;
            else if (sender) tx.type = TransactionType.OUTGOING;
            else if (recipient) tx.type = TransactionType.INCOMING;

            return entry;
        }));
    }
);

export const relevantTransactions$ = createSelector(
    typedTransactions$,
    (txs) => txs && new Map([...txs.entries()].filter(entry => entry[1].type !== TransactionType.CASHLINK_REMOTE_FUND))
);
