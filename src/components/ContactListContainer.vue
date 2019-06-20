<template>
    <div>
        <div class="header">
            <div class="x-popup-menu" left-align>
                <button add @click="addNewContact"><i class="material-icons">person_add</i> New contact</button>
                <button manage @click="toggleManaging"><i class="material-icons">mode_edit</i> Manage contacts</button>
                <button v-if="!isIOS" export @click="exportContacts"><i class="material-icons">save</i> Export contacts</button>
                <button import @click="importContacts"><i class="material-icons">insert_drive_file</i> Import contacts</button>
            </div>
            <h2>Contacts</h2>
            <i add @click="addNewContact" class="material-icons">add</i>
        </div>
        <div class="body vue-contact-list">
            <div class="contact-list">
                <template v-if="contacts.length > 3">
                    <input type="text" class="search-field" placeholder="Search..." v-model="searchTerm" ref="search">
                    <i class="material-icons search-icon">search</i>
                    <a href="#" class="material-icons search-clear" title="Clear search" v-if="searchTerm"
                       @click.prevent="clearSearch">clear</a>
                </template>

                <div class="list">
                    <span v-if="isAddingNewContact">New contact:</span>
                    <NewContact
                            v-if="isAddingNewContact"
                            @abort="abortNewContact"
                            @set="actions.setContact"
                            ref="newContact"
                    />
                    <Contact
                            v-for="contact in filteredContacts"
                            :address="contact.address"
                            :label="contact.label"
                            :show-options="isManaging"
                            :abort-trigger="abortTrigger"
                            @select="selectContact"
                            @change="changeContact"
                            @delete="deleteContact"
                            :key="contact.address"
                    />
                    <div class="no-contacts" v-if="!filteredContacts.length && !searchTerm">
                        <i class="material-icons">face</i>
                        Use the menu to add contacts
                    </div>
                    <div class="no-contacts" v-if="!filteredContacts.length && searchTerm">
                        <i class="material-icons">face</i>
                        No matches found
                    </div>
                </div>

                <label class="file-import" ref="importLabel">
                    <input type="file" @change="loadFile" ref="importInput">
                </label>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Watch, Vue, Emit, Prop } from 'vue-property-decorator';
import { ContactList } from '@nimiq/vue-components';
import { bindActionCreators } from 'redux';
import { Contact, NewContact } from '@nimiq/vue-components';
import { BrowserDetection } from '@nimiq/utils';
import { setContact, removeContact } from '../redux/contacts-redux.js';

import ReduxProvider from './ReduxProvider.vue';
import XPopupMenu from '../elements/x-popup-menu/x-popup-menu.js';
import '../elements/x-popup-menu/x-popup-menu.css';
import XToast from '../elements/x-toast/x-toast.js';
import '../elements/x-toast/x-toast.css';
import XSendTransactionModal from '../elements/x-send-transaction/x-send-transaction-modal.js';
import { spaceToDash } from '../lib/parameter-encoding.js';
import XElement from '../lib/x-element/x-element';

@Component({ components: { Contact, NewContact } })
export default class ContactListContainer extends Vue {
    @Prop(Array) public contacts!: Array<{ address: string, label: string }>;
    @Prop(Object) public actions!: any;

    private searchTerm: string = '';
    private isManaging: boolean = false;
    private isAddingNewContact: boolean = false;
    private abortTrigger: number = 0;

    private _xElements: XElement[] = [];

    private mounted() {
        /* tslint:disable:no-unused-expression */
        this._xElements = [ new XPopupMenu(this.$el.querySelector('.x-popup-menu')) ];
        /* tslint:enable:no-unused-expression */
    }

    private destroyed() {
        this._xElements.forEach((xElement) => xElement.destroy());
    }

    private isIOS() {
        return BrowserDetection.isIOS();
    }

    private selectContact(address: string) {
        XSendTransactionModal.show(spaceToDash(address), 'contact');
    }

    private notification(msg: string, type: string) {
        XToast[type || 'show'](msg);
    }

    private get filteredContacts() {
        const searchTerm = this.searchTerm.trim().toLowerCase();

        if (!searchTerm) return this.contacts;

        const result = [];
        for (const contact of this.contacts) {
            if (contact.label.toLowerCase().includes(searchTerm)) {
                result.push(contact);
            }
        }
        return result;
    }

    private reset() {
        this.isManaging = false;
        this.isAddingNewContact = false;
        this.abortTrigger += 1;
        this.clearSearch();
    }

    private changeContact(old: any, nue: any) {
        this.actions.setContact(nue.label, nue.address);
        if (old.address !== nue.address) this.actions.removeContact(old.address);
    }

    private deleteContact(oldAddress: string) {
        this.actions.removeContact(oldAddress);
    }

    private clearSearch() {
        this.searchTerm = '';
        const search: HTMLInputElement = this.$refs.search as HTMLInputElement;
        if (!search) return;
        search.focus();
    }

    private toggleManaging() {
        this.isManaging = !this.isManaging;
    }

    private addNewContact() {
        this.isAddingNewContact = true;
        Vue.nextTick(() => {
            const newContact: NewContact = this.$refs.newContact as NewContact;
            newContact.edit();
        });
    }

    private abortNewContact() {
        this.isAddingNewContact = false;
    }

    private exportContacts() {
        const text = JSON.stringify(this.contacts);

        // From https://stackoverflow.com/a/18197341/4204380
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', 'Nimiq-Safe-Contacts.json');
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    private importContacts() {
        (this.$refs.importLabel as HTMLLabelElement).click();
    }

    private loadFile(event: Event) {
        const fileList = (event.target as HTMLInputElement).files;
        if (!fileList) return;
        const file = fileList[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => this.readFile((e.target as FileReader).result);
        reader.readAsText(file);
    }

    private readFile(data: any) {
        // Reset file input
        (this.$refs.importInput as HTMLInputElement).value = '';

        let importedContacts = [];
        try {
            importedContacts = JSON.parse(data);
        } catch (e) {
            this.notification('Cannot import file, wrong format.', 'error');
            return;
        }

        // Make sure the input is a non-empty array
        if (!importedContacts.length) {
            this.notification('Cannot import file, wrong format.', 'error');
            return;
        }

        for (const newContact of importedContacts) {
            if (!newContact.label || !newContact.address) continue;

            const storedContact = this.contacts[newContact.address];
            if (storedContact) {
                if (storedContact.label === newContact.label) continue;
                else {
                    const shouldOverwrite = confirm(
                    `A contact with the address "${storedContact.address}", but a different name already exists.
\nDo you want to override it?`);
                    if (!shouldOverwrite) continue;
                }
            }

            this.actions.setContact(newContact.label, newContact.address);
        }

        this.notification('Contact import finished.', 'success');
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

.contact-list {
    position: relative;
}

.contact-list .search-field {
    width: 100%;
    border: none !important;
    padding: 1.5rem 5rem;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 0.5rem;
    text-align: left;
}

.contact-list .search-field:focus {
    background: rgba(0, 0, 0, 0.075);
}

.contact-list .search-field::placeholder {
    text-align: left;
}

.contact-list .search-icon {
    position: absolute;
    left: 1rem;
    top: 1.5rem;
    opacity: 0.4;
}

.contact-list .search-field:focus ~ .search-icon {
    opacity: 0.8;
}

.contact-list .search-clear {
    position: absolute;
    right: 0.5rem;
    top: 1rem;
    opacity: 0.4;
    padding: 0.5rem;
    border-radius: 50%;
    cursor: pointer;
}

.contact-list .search-clear:hover,
.contact-list .search-clear:focus {
    background: rgba(0, 0, 0, 0.1);
    opacity: 0.8;
}

.contact-list .list {
    margin-top: 2rem;
}

.contact-list .contact {
    padding: 1rem;
}

.contact-list .contact:hover {
    background-color: rgba(0, 0, 0, 0.075);
}

.contact-list .no-contacts {
    text-align: center;
    opacity: 0.6;
}

.contact-list .no-contacts .material-icons {
    display: block;
    font-size: 10rem;
    line-height: 1.1;
    opacity: 0.3;
}

.contact-list .file-import {
    width: 0;
    height: 0;
    opacity: 0;
    position: absolute;
    left: -9999px;
    top: -9999px;
}
</style>
