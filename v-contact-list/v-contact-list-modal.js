import VContactList from '/elements/v-contact-list/v-contact-list.js';
import MixinModal from '/elements/mixin-modal/mixin-modal.js'
import XSendTransactionModal from '/elements/x-send-transaction/x-send-transaction-modal.js'

export default class VContactListModal extends MixinModal(VContactList) {
    onCreate() {
        this._wasClosedByContactSelection = false;

        // adapt markup of v-contact-list for modal
        const header = this.$('.header');
        header.classList.replace('header', 'modal-header');
        header.querySelector('i[add]').style.display = 'none';
        const closeButton = document.createElement('i');
        closeButton.setAttribute('x-modal-close', '');
        closeButton.classList.add('material-icons');
        closeButton.textContent = 'close';
        header.appendChild(closeButton);
        this.$('.body').classList.replace('body', 'modal-body');

        super.onCreate();
    }

    styles() {
        return [ ...super.styles(), 'v-contact-list-modal' ];
    }

    listeners() {
        const listeners = super.listeners();
        delete listeners['click i[add]'];
        return listeners;
    }

    _onContactSelected(address) {
        this._wasClosedByContactSelection = true;
        super._onContactSelected(address);
    }

    onShow() {
        // Reset local state
        this._wasClosedByContactSelection = false;
        setTimeout(() => {
            this.$el.parentNode.scrollTo(0, 0); // Scroll contact list up to the top
            this.vue.$refs.contactList.reset();
        })
    }

    onHide() {
        if (this._wasClosedByContactSelection) return;
        // go back to send tx modal
        XSendTransactionModal.show('-', 'contact');
    }
}
