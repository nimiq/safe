import MixinSingleton from '../mixin-singleton/mixin-singleton.js';
import XRouter from '../x-router/x-router.js';
import XModals from './x-modals.js';
import XModalContainer from './x-modal-container.js';

const MixinModal = XElementBase => class extends MixinSingleton(XElementBase) {
    onCreate() {
        super.onCreate();
        this._route = this.attribute('x-route-aside');
        this._container = XModalContainer.createFor(this);
        this._container.$el.appendChild(this.$el); // append to the container if not already the case
        XModals.instance.$el.appendChild(this._container.$el); // append to x-modals if not already the case
    }

    styles() {
        return [ ...super.styles(), 'x-modal', 'nimiq-dark' ];
    }

    static show(...parameters) {
        this.instance.show(...parameters);
    }

    show(...parameters) {
        if (this.isVisible() || !this.allowsShow(...parameters)) return;
        if (this._route) {
            // let the router trigger the show
            XRouter.root.showAside(this._route, ...parameters);
        } else {
            XModals.show(this, ...parameters);
        }
    }

    static hide() {
        this.instance.hide();
    }

    hide() {
        if (!this.isVisible() || !this.allowsHide()) return;
        if (this._route) {
            // let the router trigger the hide
            XRouter.root.hideAside(this._route);
        } else {
            XModals.hide(this);
        }
    }

    allowsShow(...parameters) {
        return true;
    }

    allowsHide() {
        return true;
    }

    onShow(...parameters) {
        // abstract method
    }

    onHide() {
        // abstract method
    }

    get container() {
        return this._container;
    }

    // callbacks for router
    onEntry(...parameters) {
        XModals.show(this, ...parameters);
    }

    onExit() {
        XModals.hide(this);
    }

    isVisible() {
        return XModals.isVisible(this);
    }
};
export default MixinModal;
