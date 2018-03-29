import XElement from '/libraries/x-element/x-element.js';
import MixinSingleton from '../mixin-singleton/mixin-singleton.js';

export default class XModals extends MixinSingleton(XElement) {
    onCreate() {
        super.onCreate();
        this._visibleModal = null;
        this._hideTimer = null;
        this._isSwitchingModal = false;
        this._isSwitchingBack = false;
        this._switchHistory = [];
    }

    static show(modal, ...parameters) {
        this.instance._show(modal, ...parameters);
    }

    _show(modal, ...parameters) {
        if (modal === null || modal === this._visibleModal || !modal.allowsShow(...parameters)
            || (this._visibleModal && !this._visibleModal.allowsHide())) return;
        clearTimeout(this._hideTimer);

        // show background
        this.$el.style.display = 'block';
        this.$el.offsetWidth; // style update
        this.$el.style.background = 'rgba(0,0,0,0.5)';

        // avoid page scroll below the modal
        document.documentElement.style.overflow = 'hidden';

        // check whether we're switching modals (i.e. there is another modal to be hidden).
        // The router invokes show of the new modal before hide of the old modal, so we can be sure there is no
        // race condition on _visibleModal.
        this._isSwitchingModal = !!this._visibleModal;
        this._isSwitchingBack = this._isSwitchingModal && this._switchHistory.length>=2
            && this._switchHistory[this._switchHistory.length-2] === modal;
        if (!this._isSwitchingModal) this._switchHistory = [];

        // Show new modal
        // Do it with a small delay as the router invokes hide on the old modal after show on the new one but we
        // actually want to wait for the router to hide the old one first such that the hiding knows the _isSwitching flag.
        setTimeout(() => {
            // If hiding of the previous modal wasn't handled by the router (the case if the old modal doesn't have a
            // route assigned), we have to do it manually.
            if (this._visibleModal !== null) {
                this._visibleModal.hide();
            }

            this._visibleModal = modal;
            if (this._isSwitchingBack) {
                this._switchHistory.pop();
            } else {
                this._switchHistory.push(modal);
            }
            modal.onShow(...parameters);
            modal.container.animateShow(this._isSwitchingModal, this._isSwitchingBack);
            this._isSwitchingModal = false;
            this._isSwitchingBack = false;
        }, 20);
    }

    static hide(modal) {
        this.instance._hide(modal);
    }

    _hide(modal = this._visibleModal) {
        if (modal === null || modal !== this._visibleModal || !modal.allowsHide()) return;
        this._visibleModal = null;

        // Note that the router ensures that hide always gets called after show, so to determine _isSwitchingModal
        // we don't have to wait for a potential _show call after _hide

        if (!this._isSwitchingModal) {
            document.documentElement.style.overflow = null;
            this.$el.style.background = null;
            this._hideTimer = setTimeout(() => this.$el.style.display = null, XModals.ANIMATION_TIME);
            this._switchHistory = [];
        }
        modal.container.animateHide(this._isSwitchingModal, this._isSwitchingBack);
        modal.onHide();
    }

    static isVisible(modal) {
        return this.instance._visibleModal === modal;
    }
}
XModals.ANIMATION_TIME = 400;
