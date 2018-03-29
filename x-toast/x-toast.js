import XElement from '/libraries/x-element/x-element.js';
import MixinSingleton from '/secure-elements/mixin-singleton/mixin-singleton.js';

export default class XToast extends MixinSingleton(XElement) {

    html() {
        return '<div toast-content></div>';
    }

    onCreate() {
        this.$toastContent = this.$('[toast-content]');
    }

    show(message) {
        this.$toastContent.textContent = message;
        this.animate('x-toast-show');
    }

    static show(message){
        XToast.instance.show(message);
    }
}

// Inspired by: https://material.io/guidelines/components/snackbars-toasts.html#snackbars-toasts-specs