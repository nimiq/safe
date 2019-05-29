<template>
    <ReduxProvider :mapDispatchToProps="mapDispatchToProps" :mapStateToProps="mapStateToProps">
        <template slot-scope="{showBackupWords, showBackupFile, activeWallet, activeAddressInfo}">
            <App
                :showBackupWords="showBackupWords"
                :showBackupFile="showBackupFile"
                :activeWallet="activeWallet"
                :activeAddressInfo="activeAddressInfo"
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
import { activeWallet$, activeAddressInfo$ } from './selectors/wallet$.js';
import { WalletType } from './redux/wallet-redux.js';

@Component({ components: { ReduxProvider, App } })
export default class AppProvider extends Vue {
    private mapStateToProps(state: any) {
        const activeWallet = activeWallet$(state);
        const activeAddressInfo = activeAddressInfo$(state);
        const showBackupFile = activeWallet.type !== WalletType.LEGACY && !activeWallet.fileExported;
        const showBackupWords = !showBackupFile && activeWallet.type !== WalletType.LEGACY
                                && !activeWallet.wordsExported;
        return {
            height: state.network.height,
            hasConsensus: state.network.consensus === 'established',
            walletsLoaded: state.wallets.hasContent,
            activeWallet,
            activeAddressInfo,
            showBackupFile,
            showBackupWords,
        };
    }

    private mapDispatchToProps(dispatch: any) {
        return { actions: bindActionCreators( { }, dispatch) };
    }
}
</script>
