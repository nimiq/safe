<template>
    <div class="wallet-selector" :class="{ 'menu-active': isMenuActive }">
        <transition name="transition-fade">
            <div v-if="isMenuActive" @click="isMenuActive = false" class="wallet-selector-backdrop"></div>
        </transition>
        <div @click="isMenuActive = !isMenuActive" class="active-wallet-label">{{ activeWallet.label }}</div>
        <transition name="transition-from-top">
            <WalletMenu
                    v-if="isMenuActive"
                    :wallets="wallets"
                    :active-wallet-id="activeWalletId"
                    @wallet-selected="walletSelected"
                    @rename="rename"
                    @change-password="changePassword"
                    @export-file="exportFile"
                    @export-words="exportWords"
                    @logout="logout"
                    @add-account="addAccount"
                    @settings="settings"
            />
        </transition>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { WalletMenu } from '@nimiq/vue-components';
import XSettings from '../elements/x-settings/x-settings.js';
import hubClient from '../hub-client.js';

@Component({ components: { WalletMenu } })
export default class ContactListProvider extends Vue {
    @Prop(Array) public wallets!: [];
    @Prop(Object) public actions!: any;
    @Prop(Object) public activeWallet: any;

    private isMenuActive = false;

    private get activeWalletId() {
        return this.activeWallet.id;
    }

    private walletSelected(walletId: string) {
        this.actions.switchWallet(walletId);
        this.isMenuActive = false;
    }

    private rename(walletId: string) {
        hubClient.rename(walletId);
        this.isMenuActive = false;
    }

    private changePassword(walletId: string) {
        hubClient.changePassword(walletId);
        this.isMenuActive = false;
    }

    private exportFile(walletId: string) {
        hubClient.export(walletId, {fileOnly: true});
        this.isMenuActive = false;
    }

    private exportWords(walletId: string) {
        hubClient.export(walletId, {wordsOnly: true});
        this.isMenuActive = false;
    }

    private logout(walletId: string) {
        hubClient.logout(walletId);
        this.isMenuActive = false;
    }

    private addAccount() {
        hubClient.onboard();
        this.isMenuActive = false;
    }

    private settings() {
        XSettings.show();
        this.isMenuActive = false;
    }
}
</script>

<style>
.wallet-selector {
    display: inline-flex;
    justify-content: center;
    position: relative;
}

.wallet-selector .active-wallet-label {
    position: relative;
    padding: 14px;
    margin-top: -14px;
    margin-left: 10px;
    cursor: pointer;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;

    opacity: 0.7;
    transition: opacity .3s cubic-bezier(0.25, 0, 0, 1);
    font-size: 16px;
    line-height: 20px;
}

.wallet-selector .active-wallet-label:hover,
.wallet-selector.menu-active .active-wallet-label {
    opacity: 1;
}

.wallet-selector .active-wallet-label::after {
    content: '';
    margin-left: 9px;
    width: 14px;
    height: 14px;
    background-repeat: no-repeat;
    background-position: center;
    display: inline-block;
    background-size: contain;
    background-image: url('data:image/svg+xml,<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><mask id="a" fill="white"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.1 12.8c-.3.3-.7.3-1 0L.8 7.3a.7.7 0 1 1 .9-1L6.3 11c.2.2.5.2.7 0l4.7-4.7a.7.7 0 1 1 .9 1l-5.5 5.5z"/></mask><path fill-rule="evenodd" clip-rule="evenodd" d="M7.1 12.8c-.3.3-.7.3-1 0L.8 7.3a.7.7 0 1 1 .9-1L6.3 11c.2.2.5.2.7 0l4.7-4.7a.7.7 0 1 1 .9 1l-5.5 5.5z" fill="white"/><path d="M4.7 14.2c1 1 2.8 1 3.8 0l-2.8-2.8c.5-.5 1.4-.5 1.9 0l-2.9 2.8zM-.8 8.7l5.5 5.5 2.9-2.8L2 5.9-.8 8.7zm0-3.8c-1 1-1 2.8 0 3.8l2.9-2.8c.5.5.5 1.3 0 1.9L-.8 4.9zM3 5C2 4 .3 4-.8 5l2.9 2.9c-.5.5-1.4.5-2 0l3-2.9zm4.7 4.7L3 4.9.2 7.8l4.7 4.6 2.8-2.8zm2.5-4.7L5.6 9.6l2.8 2.8 4.7-4.6-2.9-2.9zM14 5c-1-1-2.7-1-3.8 0l2.9 2.9c-.5.5-1.4.5-2 0l3-2.9zm0 3.8c1-1 1-2.7 0-3.8l-2.8 2.9c-.5-.6-.5-1.4 0-2L14 8.8zm-5.5 5.5L14 8.7l-2.8-2.8-5.5 5.5 2.8 2.8zM5 12.4c1 1 2.5 1 3.5 0L5.6 9.6c.6-.6 1.5-.6 2 0L5 12.4z" fill="white" mask="url(%23a)"/></svg>');
    transition: transform .3s cubic-bezier(0.25, 0, 0, 1), margin .3s cubic-bezier(0.25, 0, 0, 1);
    transform-origin: 50% 67%;
}

.wallet-selector.menu-active .active-wallet-label::after {
    transform: rotate(180deg);
}

.wallet-selector .wallet-menu {
    position: absolute;
    top: 4rem;
    z-index: 1;
    color: var(--nimiq-blue);
    text-align: left;
    transition: opacity .3s ease-out, transform .3s ease-out;
    min-height: unset !important;
}

.wallet-selector button {
    box-shadow: unset;
    width: unset;
    min-height: unset;
    margin: unset;
    text-transform: unset;
    font-size: unset;
    font-weight: unset;
    letter-spacing: unset;
    height: unset;
    max-width: unset;
    vertical-align: unset;
    user-select: unset;
    outline: unset;
    line-height: unset;
    border-radius: unset;
    display: unset;
}

.nq-button-s.add-account:hover {
    background-color: rgba(31, 35, 72, 0.12); /* Based on Nimiq Blue */
}

.nq-button-s.add-account:focus {
    outline: none;
    color: var(--nimiq-light-blue);
    background-color: rgba(5, 130, 202, 0.16); /* Based on Nimiq Light Blue */
}

.wallet-selector-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    -webkit-tap-highlight-color: transparent;
    background: var(--nimiq-blue);
    opacity: .8;
    z-index: 1;
    transition: opacity .4s ease-in-out;
}

.wallet-selector.menu-active .active-wallet-label {
    z-index: 1;
}

.transition-fade-enter,
.transition-fade-leave-to {
    opacity: 0;
}

.transition-from-top-enter,
.transition-from-top-leave-to {
    opacity: 0;
    transform: translateY(-1rem);
}

@media (max-width: 620px) {
    .wallet-selector .wallet-menu {
        width: calc(100vw - 4rem);
    }

    .wallet-selector [active-wallet-label] {
        padding: 14px 8px;
        margin-left: 6px;
    }
}
</style>
