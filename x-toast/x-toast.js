import XElement from '/library/x-element/x-element.js';

export default class XToast extends XElement {

    constructor() {
        super(document.createElement('x-toast'));  // create a proxy in parent XElement. The actual toast is a XToastContainer attached to the document's body.
    }

    onCreate() {
        const parent = document.body;
        const $popup = XToastContainer.createElement();
        parent.appendChild($popup.$el);
        this.$toastPopup = $popup;
    }

    show(message) {
        this.$toastPopup.show(message);
    }
}

class XToastContainer extends XElement {
    html() { return `<x-toast-popup></x-toast-popup>` }

    show(message) {
        const $popup = this.$('x-toast-popup')
        $popup.textContent = message;
        this.animate('x-toast-show');
    }
}

// Inspired by: https://material.io/guidelines/components/snackbars-toasts.html#snackbars-toasts-specs