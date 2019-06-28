import XElement from '../../lib/x-element/x-element';
import XRouter from '../x-router/x-router.js';
import { IModal } from './mixin-modal';
import { MixinSingletonX } from '../mixin-singleton';

export default class XModals extends MixinSingletonX(XElement) {
    public static readonly ANIMATION_TIME = 400;

    public static async show(triggeredByRouter: boolean, modal: IModal, ...parameters: any[]) {
        const visibleModal = XModals.visibleModal;
        if (modal === null || modal === visibleModal /*|| modal === incomingModal*/
            || !modal.allowsShow(...parameters)
            || (visibleModal && !visibleModal.allowsHide(modal))) return;
        let router = null;

        if (!triggeredByRouter && modal.route && visibleModal && visibleModal.route) {
            router = await XRouter.instance;
            router.replaceAside(visibleModal.route, modal.route, parameters);
            return;
        }

        if (triggeredByRouter || !modal.route) {
            XModals.getInstance()._show(modal, ...parameters);
        } else {
            router = await XRouter.instance;
            router.showAside(modal.route, parameters);
        }

        if (!visibleModal) return;

        if (triggeredByRouter || !visibleModal.route) {
            XModals.getInstance()._hide(visibleModal);
        } else {
            router = router || await XRouter.instance;
            router.hideAside(visibleModal.route);
        }
    }

    public static async hide(triggeredByRouter: boolean, modal: IModal, force = false) {
        const visibleModal = XModals.visibleModal;
        if (modal === null || modal !== visibleModal
            || (!force && !modal.allowsHide(XModals.getInstance()._incomingModal!))) return;
        if (triggeredByRouter || !modal.route || force) {
            this.getInstance()._hide(modal);
        } else {
            // let the router trigger the hide
            const router = await XRouter.instance;
            router.hideAside(modal.route);
        }
    }

    public static get visibleModal() {
        return this.getInstance()._visibleModal;
    }

    private _visibleModal: IModal | null = null;
    private _incomingModal: IModal | null = null;
    private _isSwitchingModal: boolean = false;
    private _isSwitchingBack: boolean = false;
    private _switchHistory: IModal[] = [];
    private _hideTimer?: number;
    private _showTimer?: number;

    private _setIncomingModal(modal: IModal) {
        this._incomingModal = modal;
        // check whether we're switching modals (i.e. there is another modal to be hidden).
        // _setIncomingModal is always called before hide of the old modal, so we can be sure there is no
        // race condition on _visibleModal.
        this._isSwitchingModal = !!this._visibleModal;
        this._isSwitchingBack = this._isSwitchingModal && this._switchHistory.length >= 2
            && this._switchHistory[this._switchHistory.length - 2] === modal;
    }

    private _clearIncomingModal() {
        this._incomingModal = null;
        this._isSwitchingModal = false;
        this._isSwitchingBack = false;
    }

    private _show(modal: IModal, ...parameters: any[]) {
        clearTimeout(this._hideTimer);
        clearTimeout(this._showTimer); // stop potential other incoming modal
        this._setIncomingModal(modal);

        // show background
        this.$el.style.display = 'block';
        // tslint:disable-next-line:no-unused-expression
        this.$el.offsetWidth; // style update
        this.$el.style.background = '#1f2348cc'; // --nimiq-blue with 80% opacity

        // avoid page scroll below the modal
        // TODO this leads to a jumping of the page caused by the disappearing scroll bar. Test whether we can
        // block the scrolling by preventDefault of the scroll event
        document.documentElement.style.overflow = 'hidden';

        // Show new modal
        // Do it with a small delay as the router invokes hide on the old modal after show on the new one but we
        // actually want to wait for the router to hide the old one first such that the hiding knows the
        // _isSwitching flag.
        this._showTimer = window.setTimeout(() => {
            this._visibleModal = modal;
            if (!this._isSwitchingModal) this._switchHistory = [];
            if (this._isSwitchingBack) {
                this._switchHistory.pop();
            } else {
                this._switchHistory.push(modal);
            }
            modal.onShow(...parameters);
            modal.container.animateShow(this._isSwitchingModal, this._isSwitchingBack);
            this._clearIncomingModal();
        }, 20);
    }

    private _hide(modal = this._visibleModal) {
        // Note that the router ensures that hide always gets called after show, so to determine _isSwitchingModal
        // we don't have to wait for a potential _show call after _hide

        if (!modal) return;

        if (!this._isSwitchingModal) {
            this._visibleModal = null;
            document.documentElement.style.overflow = null;
            this.$el.style.background = null;
            this._hideTimer = window.setTimeout(() => this.$el.style.display = null, XModals.ANIMATION_TIME);
            this._switchHistory = [];
        }
        modal.container.animateHide(this._isSwitchingModal, this._isSwitchingBack);
        modal.onHide();
    }
}
