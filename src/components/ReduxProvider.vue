<template>
    <Provider :mapDispatchToProps="mapDispatchToProps" :mapStateToProps="mapStateToProps" :store="store">
        <template v-slot="props">
            <slot v-bind="props"></slot>
        </template>
    </Provider>
</template>

<script lang="ts">
import store from '../store.js';
import Provider from 'vuejs-redux';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({ components: {Provider}})
export default class ReduxProvider extends Vue {
    @Prop(Function) public mapStateToProps!: (state: any) => object;
    @Prop(Function) public mapDispatchToProps!: (dispatch: any) => object;

    public store = store;
}
</script>
