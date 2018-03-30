import XElement from '/libraries/x-element/x-element.js';
import MixinSingleton from '/secure-elements/mixin-singleton/mixin-singleton.js';

export default class XToast extends MixinSingleton(XElement) {

    html() {
        return '<div toast-content></div>';
    }

    onCreate() {
        this.$toastContent = this.$('[toast-content]');
    }

    show(message, type) {
        this.$toastContent.textContent = message;
        this.$toastContent.className = type;
        this.animate('x-toast-show');
    }

    static show(message, type = "normal"){
        XToast.instance.show(message, type);
    }

    static success(message){
        XToast.instance.show(message, 'success');
    }

    static warn(message){
        XToast.instance.show(message, 'warning');
    }

    static warning(message){
        XToast.instance.show(message, 'warning');
    }

    static error(message){
        XToast.instance.show(message, 'error');
    }
}

// Inspired by: https://material.io/guidelines/components/snackbars-toasts.html#snackbars-toasts-specs
