import { createSelector } from '../lib/reselect/src/index.js';

import { CashlinkStatus } from '../cashlink-redux.js';
import { activeWalletId$ } from './account$.js';

export const cashlinks$ = state => state.cashlinks.cashlinks;

export const activeCashlinks$ = createSelector(
    cashlinks$,
    activeWalletId$,
    (cashlinks, activeWalletId) => new Map([...cashlinks.entries()].filter(
        entry => entry[1].walletIds.includes(activeWalletId)
    ))
)

export const numberUnclaimedCashlinks$ = createSelector(
    activeCashlinks$,
    (activeCashlinks) => [...activeCashlinks.values()]
        .filter(cashlink => cashlink.status <= CashlinkStatus.UNCLAIMED)
        .length
);
