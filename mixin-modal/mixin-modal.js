import XElement from '/libraries/x-element/x-element.js';
import MixinSingleton from '../mixin-singleton/mixin-singleton.js';
import XRouter from '../x-router/x-router.js';

class XModalContainer extends MixinSingleton(XElement) {
    onCreate() {
        super.onCreate();
        this._visibleModal = null;
        this.$el.setAttribute('tabindex', '-1');
        this.$el.addEventListener('click', e => this._onBackdropClick(e));
        this.$el.addEventListener('keydown', e => this._onEscape(e));
    }

    static show(modal) {
        this.instance._show(modal);
    }

    async _show(modal) {
        if (modal === null || modal === this._visibleModal) return false;
        // check whether new modal allows to be shown
        if (modal._onBeforeShow && modal._onBeforeShow() === false) return false;
        // hide currently visible modal
        if (this._visibleModal && !await this._hide(this._visibleModal, true)) {
            // other modal refused to hide
            return false;
        }
        const modalEl = modal.$el;
        modalEl.classList.add('display');
        this.$el.classList.add('display');
        this.$el.offsetWidth; // style update
        modalEl.offsetWidth; // style update
        this.$el.classList.add('visible');
        modalEl.classList.add('visible');
        this.$el.focus();
        this._visibleModal = modal;
        if (modal._onShow) modal._onShow();
        return true;
    }

    static hide(modal) {
        this.instance._hide(modal);
    }

    async _hide(modal = this._visibleModal, keepBackdrop = false) {
        if (modal === null || modal !== this._visibleModal) return false;
        if (modal._onBeforeHide && modal._onBeforeHide() === false) return false;
        const modalEl = modal.$el;
        modalEl.classList.remove('visible');
        if (!keepBackdrop) this.$el.classList.remove('visible');
        this._visibleModal = null;
        if (modal._onHide) modal._onHide();

        return new Promise(resolve => {
            setTimeout(() => {
                modalEl.classList.remove('display');
                if (!keepBackdrop) this.$el.classList.remove('display');
                resolve(true);
            }, XModalContainer.ANIMATION_TIME)
        });
    }

    _onBackdropClick(e) {
        if (e.target !== this.$el) return;
        this._hide(this._visibleModal);
    }

    _onEscape(e) {
        if (e.keyCode !== 27) return; // other key than escape
        this._hide(this._visibleModal);
    }
}
XModalContainer.ANIMATION_TIME = 700;


const MixinModal = XElementBase => class extends MixinSingleton(XElementBase) {
    onCreate() {
        super.onCreate();
        if (this.$el.parentNode !== XModalContainer.instance.$el) {
            XModalContainer.instance.$el.appendChild(this.$el);
        }
    }

    styles() {
        return [ ...super.styles(), 'x-modal', 'nimiq-dark' ];
    }

    static show() {
        const instance = this.instance;
        const route = instance.$el.getAttribute('x-route-aside');
        if (route) {
            // let the router trigger the show
            XRouter.root.showAside(route);
        } else {
            XModalContainer.show(instance);
        }
    }

    static hide() {
        const instance = this.instance;
        const route = instance.$el.getAttribute('x-route-aside');
        if (route) {
            // let the router trigger the show
            XRouter.root.hideAside(route);
        } else {
            XModalContainer.hide(instance);
        }
    }

    // callbacks for router
    _onEntry() {
        XModalContainer.show(this);
    }

    _onExit() {
        XModalContainer.hide(this);
    }
};
export default MixinModal;
