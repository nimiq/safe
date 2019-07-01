<template>
    <ReduxProvider :mapDispatchToProps="mapDispatchToProps" :mapStateToProps="mapStateToProps">
        <template v-slot="{hasConsensus, blockchainHeight, showBackupWords, showBackupFile, activeWallet}">
            <App
                :hasConsensus="hasConsensus"
                :blockchainHeight="blockchainHeight"
                :showBackupWords="showBackupWords"
                :showBackupFile="showBackupFile"
                :activeWallet="activeWallet"
            />
        </template>
    </ReduxProvider>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { bindActionCreators } from 'redux';

import ReduxProvider from './components/ReduxProvider.vue';
import App from './App.vue';
import store from './store.js';
import { activeWallet$ } from './selectors/wallet$.js';
import { WalletType } from './redux/wallet-redux.js';

@Component({ components: { ReduxProvider, App } })
export default class AppProvider extends Vue {
    private mapStateToProps(state: any) {
        const activeWallet = activeWallet$(state);
        const showBackupFile = activeWallet.type !== WalletType.LEGACY && !activeWallet.fileExported;
        const showBackupWords = !showBackupFile && activeWallet.type !== WalletType.LEGACY
                                && !activeWallet.wordsExported;
        return {
            blockchainHeight: state.network.height,
            hasConsensus: state.network.consensus === 'established',
            walletsLoaded: state.wallets.hasContent,
            activeWallet,
            showBackupFile,
            showBackupWords,
        };
    }

    private mapDispatchToProps(dispatch: any) {
        return { actions: bindActionCreators( { }, dispatch) };
    }
}
</script>
