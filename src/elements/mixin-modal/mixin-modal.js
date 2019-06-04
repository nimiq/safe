import MixinSingleton from '../mixin-singleton.js';
import XModals from './x-modals.js';
import XModalContainer from './x-modal-container.js';

const MixinModal = XElementBase => class extends MixinSingleton(XElementBase) {
    onCreate() {
        super.onCreate();
        this._route = this.attribute('x-route-aside');
        this._container = XModalContainer.createFor(this);
        this._container.$el.appendChild(this.$el); // append to the container if not already the case
        XModals.instance.$el.appendChild(this._container.$el); // append to x-modals if not already the case
        this.$closeButton = this.$el.querySelector('[x-modal-close]');
        if (this.$closeButton) this.$closeButton.addEventListener('click', () => this.hide());
    }

    styles() {
        return [ ...super.styles(), 'x-modal' ];
    }

    static show(...parameters) {
        this.instance.show(...parameters);
    }

    show(...parameters) {
        XModals.show(false, this, ...parameters);
    }

    static hide() {
        this.instance.hide();
    }

    hide(force = false) {
        XModals.hide(false, this, force);
    }

    allowsShow(...parameters) {
        return true;
    }

    allowsHide(incomingModal) {
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

    get route() {
        return this._route;
    }

    // callbacks for router
    onEntry(...parameters) {
        XModals.show(true, this, ...parameters);
    }

    onExit() {
        XModals.hide(true, this);
    }
};
export default MixinModal;
