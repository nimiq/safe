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

export const activeUnclaimedCashlinksArray$ = createSelector(
    activeCashlinks$,
    (activeCashlinks) => [...activeCashlinks.values()]
        .filter(cashlink => cashlink.status <= CashlinkStatus.UNCLAIMED)
)

export const activeUnclaimedCashlinkAddresses$ = createSelector(
    activeUnclaimedCashlinksArray$,
    (activeUnclaimedCashlinksArray) => activeUnclaimedCashlinksArray
        .map(cashlink => cashlink.address)
)

export const numberUnclaimedCashlinks$ = createSelector(
    activeUnclaimedCashlinksArray$,
    (activeUnclaimedCashlinksArray) => activeUnclaimedCashlinksArray.length
);
