import XElement from '/libraries/x-element/x-element.js';
import XSingleton from '../x-singleton/x-singleton.js';

class XModalContainer extends XSingleton(XElement) {
    onCreate() {
        this._visibleModal = null;
        this.$el.addEventListener('click', e => this._onBackdropClick(e));
    }

    static show(modal) {
        this.instance._show(modal);
    }

    async _show(modal) {
        if (modal === null || modal === this._visibleModal) return;
        if (this._visibleModal) {
            await this._hide(this._visibleModal, true);
        }
        const modalEl = modal.$el;
        modalEl.classList.add('display');
        this.$el.classList.add('display');
        this.$el.offsetWidth; // style update
        modalEl.offsetWidth; // style update
        this.$el.classList.add('visible');
        modalEl.classList.add('visible');
        this._visibleModal = modal;
        if (modal._onShow) modal._onShow();
    }

    static hide(modal) {
        this.instance._hide(modal);
    }

    async _hide(modal = this._visibleModal, keepBackdrop = false) {
        if (modal === null || modal !== this._visibleModal) return;
        const modalEl = modal.$el;
        modalEl.classList.remove('visible');
        if (!keepBackdrop) this.$el.classList.remove('visible');
        this._visibleModal = null;
        if (modal._onHide) modal._onHide();

        return new Promise(resolve => {
            setTimeout(() => {
                modalEl.classList.remove('display');
                if (!keepBackdrop) this.$el.classList.remove('display');
                resolve();
            }, XModalContainer.ANIMATION_TIME)
        });
    }

    _onBackdropClick(e) {
        if (e.target === this.$el) {
            this._hide(this._visibleModal);
        }
    }
}
XModalContainer.ANIMATION_TIME = 700;


const XModal = XElementBase => class extends XSingleton(XElementBase) {
    onCreate() {
        super.onCreate();
        if (this.$el.parentNode !== XModalContainer.instance.$el) {
            XModalContainer.instance.$el.appendChild(this.$el);
        }
    }

    styles() {
        return [ ...super.styles(), 'x-modal'];
    }

    static show() {
        XModalContainer.show(this.instance);
    }

    static hide() {
        XModalContainer.hide(this.instance);
    }
};
export default XModal;
