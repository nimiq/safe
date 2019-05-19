<template>
  <ReduxProvider :mapDispatchToProps="mapDispatchToProps" :mapStateToProps="mapStateToProps">
    <template slot-scope="{wallets, activeWallet}">
        <WalletSelectorContainer :wallets="wallets" :activeWallet="activeWallet" :actions="actions" />
    </template>
  </ReduxProvider>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { bindActionCreators } from 'redux';
import { switchWallet } from '../redux/wallet-redux.js';
import WalletSelectorContainer from './WalletSelectorContainer.vue';
import { walletsArray$, activeWallet$ } from '../selectors/wallet$.js';

import ReduxProvider from './ReduxProvider.vue';

@Component({ components: { ReduxProvider, WalletSelectorContainer } })
export default class ContactListProvider extends Vue {
    public mapStateToProps(state: any) {
        return {
            wallets: walletsArray$(state),
            activeWallet: activeWallet$(state),
        };
    }

    private mapDispatchToProps(dispatch: any) {
        return { actions: bindActionCreators({ switchWallet }, dispatch)};
    }
}
</script>
