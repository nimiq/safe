import XElement from '../../lib/x-element/x-element.js';
import { MixinSingletonX } from '../mixin-singleton';

export default class XToast extends MixinSingletonX(XElement) {

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
        XToast.getInstance().show(message, type);
    }

    static success(message){
        XToast.getInstance().show(message, 'success');
    }

    static warn(message){
        XToast.getInstance().show(message, 'warning');
    }

    static warning(message){
        XToast.getInstance().show(message, 'warning');
    }

    static error(message){
        XToast.getInstance().show(message, 'error');
    }
}

// Inspired by: https://material.io/guidelines/components/snackbars-toasts.html#snackbars-toasts-specs
