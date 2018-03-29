import XElement from '/libraries/x-element/x-element.js';
import XRouter from '../../secure-elements/x-router/x-router.js';
import MixinSingleton from '../../secure-elements/mixin-singleton/mixin-singleton.js';

export default class XModals extends MixinSingleton(XElement) {
    onCreate() {
        super.onCreate();
        this._visibleModal = null;
        this._hideTimer = null;
        this._isSwitchingModal = false;
        this._isSwitchingBack = false;
        this._switchHistory = [];
    }

    static async show(triggeredByRouter, modal, ...parameters) {
        const visibleModal = XModals.visibleModal;
        if (modal === null || modal === visibleModal || !modal.allowsShow(...parameters)
            || (visibleModal && !visibleModal.allowsHide())) return;
        let router = null;

        if (!triggeredByRouter && modal.route && visibleModal && visibleModal.route) {
            router = await XRouter.instance;
            router.replaceAside(visibleModal.route, modal.route, ...parameters);
            return;
        }

        if (triggeredByRouter || !modal.route) {
            XModals.instance._show(modal, ...parameters);
        } else {
            router = await XRouter.instance;
            router.showAside(modal.route, ...parameters);
        }

        if (!visibleModal) return;

        if (triggeredByRouter || !visibleModal.route) {
            XModals.instance._hide(visibleModal);
        } else {
            router = router || await XRouter.instance;
            router.hideAside(visibleModal.route);
        }
    }

    _show(modal, ...parameters) {
        clearTimeout(this._hideTimer);

        // show background
        this.$el.style.display = 'block';
        this.$el.offsetWidth; // style update
        this.$el.style.background = 'rgba(0,0,0,0.5)';

        // avoid page scroll below the modal
        // TODO this leads to a jumping of the page cause by the disappearing scroll bar. Test whether we can
        // block the scrolling by preventDefault of the scroll event
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

    static async hide(triggeredByRouter, modal) {
        const visibleModal = XModals.visibleModal;
        if (modal === null || modal !== visibleModal || !modal.allowsHide()) return;
        if (triggeredByRouter || !modal.route) {
            this.instance._hide(modal);
        } else {
            // let the router trigger the hide
            const router = await XRouter.instance;
            router.hideAside(modal.route);
        }
    }

    _hide(modal = this._visibleModal) {
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

    static get visibleModal() {
        return this.instance._visibleModal;
    }
}
XModals.ANIMATION_TIME = 400;
