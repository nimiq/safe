<template>
    <div>
        <div class="header">
            <div class="x-popup-menu" left-align>
                <button add><i class="material-icons">person_add</i> New contact</button>
                <button manage><i class="material-icons">mode_edit</i> Manage contacts</button>
                <button export><i class="material-icons">save</i> Export contacts</button>
                <button import><i class="material-icons">insert_drive_file</i> Import contacts</button>
            </div>
            <h2>Contacts</h2>
            <i add class="material-icons">add</i>
        </div>
        <div class="body vue-contact-list">
            <ContactList
                slot-scope="{contacts}"
                :contacts="contacts"
                @select-contact="selectContact"
                @set-contact="setContact"
                @remove-contact="removeContact"
                @notification="notification"
                ref="contactList"
            />
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Watch, Vue } from 'vue-property-decorator';
import { ContactList } from '@nimiq/vue-components/dist/NimiqVueComponents.common.js';

import XPopupMenu from '../elements/x-popup-menu/x-popup-menu.js';
import '../elements/x-popup-menu/x-popup-menu.css';

@Component({ components: { ContactList } })
export default class ContactListContainer extends Vue {
    mounted() {
        new XPopupMenu(this.$el.querySelector('.x-popup-menu'));
    }
}
</script>

<style scoped>
/* style header for stand alone v-contact-list similar to modal header */

.header {
    position: relative;
    padding-left: 32px;
}

/* align popup menu button (three dots) to borders of header and center to title */
.header .x-popup-menu {
    position: absolute;
    left: -14px;
    top: -14px;
    width: 100%; /* to render the list correctly */
}

/* similar style to x-popup-menu trigger */
.header > [add] {
    position: absolute;
    top: -10px;
    right: -8px;
    width: 40px;
    height: 40px;
    padding: 8px;
    cursor: pointer;
}
.header > [add]:hover {
    border-radius: 50%;
    background-color: rgba(0, 0, 0, .075);
}
</style>
