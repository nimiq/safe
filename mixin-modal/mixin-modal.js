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

    _show(modal) {
        if (modal === null || modal === this._visibleModal) return false;
        // check whether new modal allows to be shown
        if (modal._onBeforeShow && modal._onBeforeShow() === false) return false;
        let waitTime = 0;
        // hide currently visible modal
        if (this._visibleModal) {
            this._keepBackdropOnNextHide = true;
            this._visibleModal.hide();
            waitTime = XModalContainer.ANIMATION_TIME;
        }
        if (this._visibleModal !== null) {
            // previous modal refused to hide
            return false;
        }
        if (modal._onShow) modal._onShow();
        setTimeout(() => {
            const modalEl = modal.$el;
            modalEl.classList.add('display');
            this.$el.classList.add('display');
            this.$el.offsetWidth; // style update
            modalEl.offsetWidth; // style update
            this.$el.classList.add('visible');
            modalEl.classList.add('visible');
            this.$el.focus();
            this._visibleModal = modal;
        }, waitTime);
        return true;
    }

    static hide(modal) {
        this.instance._hide(modal);
    }

    _hide(modal = this._visibleModal) {
        const keepBackdrop = this._keepBackdropOnNextHide;
        this._keepBackdropOnNextHide = false;
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
        if (this._visibleModal) {
            this._visibleModal.hide();
        }
    }

    _onEscape(e) {
        if (e.keyCode !== 27) return; // other key than escape
        if (this._visibleModal) {
            this._visibleModal.hide();
        }
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

    static show(parameters) {
        this.instance.show(parameters);
    }

    show(parameters) {
        const route = this.attribute('x-route-aside');
        if (route) {
            // let the router trigger the show
            XRouter.root.showAside(route, parameters);
        } else {
            XModalContainer.show(this);
        }
    }

    static hide() {
        this.instance.hide();
    }

    hide() {
        const route = this.attribute('x-route-aside');
        if (route) {
            // let the router trigger the hide
            XRouter.root.hideAside(route);
        } else {
            XModalContainer.hide(this);
        }
    }

    // callbacks for router
    onEntry() {
        XModalContainer.show(this);
    }

    onExit() {
        XModalContainer.hide(this);
    }
};
export default MixinModal;
