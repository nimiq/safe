<template>
    <div id="app">
        <header class="logo">
            <span class="nq-icon nimiq-logo"></span>
            <span class="logo-wordmark">Nimiq</span>
            <span class="logo-subtitle"></span>
        </header>
        HEY
    </div>
</template>

<script lang="ts">
import { Component, Watch, Vue } from 'vue-property-decorator';
import { LoadingSpinner } from '@nimiq/vue-components';
import MixinSingleton from './elements/mixin-singleton.js';
import XLoader from './elements/x-loader.js';
import XSafe from './elements/x-safe.js';

import '@nimiq/style/nimiq-style.min.css';
import '@nimiq/vue-components/dist/NimiqVueComponents.css';

@Component
export default class App extends Vue {

    public async created() {
        const $appContainer = document.getElementById('app');

        // set singleton app container
        MixinSingleton.appContainer = $appContainer;

        // start UI
        new XSafe($appContainer);
    }
}
</script>

<style>
</style>
