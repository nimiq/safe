import XElement from '/libraries/x-element/x-element.js'
import MixinModal from '/elements/mixin-modal/mixin-modal.js'
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js'
import { bindActionCreators } from '/libraries/redux/src/index.js'
import XSendTransactionModal from '/elements/x-send-transaction/x-send-transaction-modal.js'
import { spaceToDash } from '/libraries/nimiq-utils/parameter-encoding/parameter-encoding.js'
import { setContact, removeContact } from './contacts-redux.js'
import XPopupMenu from '/elements/x-popup-menu/x-popup-menu.js'
import XToast from '/secure-elements/x-toast/x-toast.js';

export default class VContactListModal extends MixinModal(XElement) {
    html() {
        return `
            <div class="modal-header">
                <x-popup-menu left-align>
                    <button add><i class="material-icons">person_add</i> New contact</button>
                    <button manage><i class="material-icons">mode_edit</i> Manage contacts</button>
                    <button export><i class="material-icons">save</i> Export contacts</button>
                    <button import><i class="material-icons">insert_drive_file</i> Import contacts</button>
                </x-popup-menu>
                <i x-modal-close class="material-icons">close</i>
                <h2>Contacts</h2>
            </div>
            <div class="modal-body" id="vue-contact-list">
                <!-- Vue template -->
                <redux-provider :map-state-to-props="mapStateToProps" :map-dispatch-to-props="mapDispatchToProps" :store="store">
                    <contact-list slot-scope="{contacts, actions}" :contacts="contacts" :actions="actions" ref="contactList"></contact-list>
                </redux-provider>
                <!-- End Vue template -->
            </div>
        `
    }

    children() { return [ XPopupMenu ] }

    listeners() {
        return {
            'click button[add]': () => this.vue.$refs.contactList.addNewContact(),
            'click button[manage]': () => this.vue.$refs.contactList.toggleManaging(),
            'click button[export]': () => this.vue.$refs.contactList.export(),
            'click button[import]': () => this.vue.$refs.contactList.import()
        }
    }

    onCreate() {
        super.onCreate()
        const self = this

        Vue.prototype.$eventBus = new Vue({})
        Vue.prototype.$toast = XToast

        this.vue = new Vue({
            el: '#vue-contact-list',
            data: {
                store: MixinRedux.store
            },
            created() {
                this.$eventBus.$on('contact-selected', address => {
                    self._wasClosedByContactSelection = true
                    self._onContactSelected(address)
                })
            },
            methods: {
                mapStateToProps(state) {
                    return {
                        contacts: state.contacts
                    }
                },

                mapDispatchToProps(dispatch) {
                    return {
                        actions: bindActionCreators({ setContact, removeContact }, dispatch)
                    }
                }
            },
            components: {
                'redux-provider': NimiqComponents.ReduxProvider,
                'contact-list': NimiqComponents.ContactList
            }
        })
    }

    onShow(isStandalone) {
        this._isStandalone = isStandalone
        // Reset local state
        this._wasClosedByContactSelection = false
        setTimeout(() => {
            this.$el.parentNode.scrollTo(0, 0) // Scroll contact list up to the top
            this.vue.$refs.contactList.reset()
        })
    }

    onHide() {
        this.vue.$eventBus.$emit('contact-list-closed')
        if (this._wasClosedByContactSelection) return
        if (!this._isStandalone) XSendTransactionModal.show('-', 'contact')
    }

    _onContactSelected(address) {
        XSendTransactionModal.show(spaceToDash(address), 'contact')
    }
}
