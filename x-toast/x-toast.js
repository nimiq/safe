import XElement from '/library/x-element/x-element.js';

export default class XToast extends XElement {

    constructor() {
        super(document.createElement('proxy'));  // create a proxy in parent XElement. The actual toast is a XToastContainer attached to the document's body.
    }

    show(message) {
        XToast.show(message);
    }
    
    static _initContainer(){
        const parent = document.body;
        const $container = XToastContainer.createElement();
        parent.appendChild($container.$el);
        XToast.$toastContainer = $container;
    }

    static show(message){
        if(!XToast.$toastContainer) this._initContainer();
        this.$toastContainer.show(message);
    }
}

class XToastContainer extends XElement {
    html() { return `<x-toast></x-toast>` }

    show(message) {
        const $toast = this.$('x-toast');
        $toast.textContent = message;
        this.animate('x-toast-show');
    }
}

// Inspired by: https://material.io/guidelines/components/snackbars-toasts.html#snackbars-toasts-specs