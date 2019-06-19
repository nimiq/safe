<template>
    <ReduxProvider :mapDispatchToProps="mapDispatchToProps" :mapStateToProps="mapStateToProps">
        <template v-slot="{contacts, actions}">
            <ContactListContainer :contacts="contacts" :actions="actions"/>
        </template>
    </ReduxProvider>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { bindActionCreators } from 'redux'
import { setContact, removeContact } from '../redux/contacts-redux.js'
import ContactListContainer from './ContactListContainer.vue';

import ReduxProvider from './ReduxProvider.vue';
import Provider from 'vuejs-redux';

@Component({ components: { ReduxProvider, ContactListContainer } })
export default class ContactListProvider extends Vue {
    private mapStateToProps(state: any) {
        return {
            contacts: Object.values(state.contacts),
        };
    }

    private mapDispatchToProps(dispatch: any) {
        return { actions: bindActionCreators( { setContact, removeContact }, dispatch) };
    }
}
</script>
