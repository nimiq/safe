import XElement from '/libraries/x-element/x-element.js';
import MixinSingleton from '../mixin-singleton/mixin-singleton.js';

class XModalContainer extends MixinSingleton(XElement) {
    onCreate() {
        this._visibleModal = null;
        this.$el.classList.add('nimiq-dark');
        this.$el.setAttribute('tabindex', '-1');
        this.$el.addEventListener('click', e => this._onBackdropClick(e));
        this.$el.addEventListener('keydown', e => this._onEscape(e));
    }

    static show(modal) {
        this.instance._show(modal);
    }

    async _show(modal) {
        if (modal === null || modal === this._visibleModal) return;
        if (this._visibleModal) {
            await this._hide(this._visibleModal, true);
        }
        if (modal._onBeforeShow) if (modal._onBeforeShow() === false) return;
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
    }

    static hide(modal) {
        this.instance._hide(modal);
    }

    async _hide(modal = this._visibleModal, keepBackdrop = false) {
        if (modal === null || modal !== this._visibleModal) return;
        if (modal._onBeforeHide) if (modal._onBeforeHide() === false) return;
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
        return [ ...super.styles(), 'x-modal' ];
    }

    static show() {
        XModalContainer.show(this.instance);
    }

    static hide() {
        XModalContainer.hide(this.instance);
    }
};
export default MixinModal;
