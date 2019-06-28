import XElement from '../../lib/x-element/x-element';
import { ModalComponent } from './mixin-modal';

export default class XModalContainer extends XElement {
    public static readonly ANIMATION_TIME = 400;

    public static createFor(modal: ModalComponent) {
        const parent = modal.$el.parentNode as HTMLElement;
        let modalContainer;
        if (parent && parent.nodeName.toLowerCase() === 'x-modal-container') {
            modalContainer = new XModalContainer(parent);
        } else {
            modalContainer = XModalContainer.createElement();
        }
        modalContainer._modal = modal;
        return modalContainer;
    }

    private _modal!: ModalComponent;
    private _hideTimer?: number;

    public animateShow(isSwitching: boolean, isSwitchingBack: boolean) {
        clearTimeout(this._hideTimer);
        this.$el.style.display = 'flex';
        const $modalEl = this._modal.$el as HTMLElement;
        $modalEl.style.animationName = '';
        // tslint:disable:no-unused-expression
        this.$el.offsetWidth; // style update
        $modalEl.offsetWidth; // style update
        // tslint:enable:no-unused-expression
        this.$el.focus();
        this.$el.style.zIndex = '1';
        $modalEl.style.animationDelay = isSwitching ? XModalContainer.ANIMATION_TIME / 2 + 'ms' : '0s';
        $modalEl.style.animationDirection = 'normal';
        $modalEl.style.animationName = !isSwitching ? 'grow, fade'
            : isSwitchingBack ? 'from-left' : 'from-right';
    }

    public animateHide(isSwitching: boolean, isSwitchingBack: boolean) {
        const $modalEl = this._modal.$el as HTMLElement;
        $modalEl.style.animationName = '';
        // tslint:disable:no-unused-expression
        this.$el.offsetWidth; // style update
        $modalEl.offsetWidth; // style update
        // tslint:enable:no-unused-expression
        this.$el.blur();
        this.$el.style.zIndex = '0';
        $modalEl.style.animationDelay = '0s';
        $modalEl.style.animationDirection = 'reverse';
        $modalEl.style.animationName = !isSwitching ? 'grow, fade'
            : isSwitchingBack ? 'from-right' : 'from-left';
        this._hideTimer = window.setTimeout(() => this.$el.style.display = 'none', XModalContainer.ANIMATION_TIME);
    }

    protected onCreate() {
        super.onCreate();
        delete this._hideTimer;
        this.$el.setAttribute('tabindex', '-1');
        this.$el.addEventListener('click', (e) => this._onBackdropClick(e));
        this.$el.addEventListener('keydown', (e) => this._onEscape(e));
    }

    private _onBackdropClick(e: Event) {
        if (e.target !== this.$el) return; // clicked on a child
        this._modal.hide();
    }

    private _onEscape(e: KeyboardEvent) {
        if (e.key !== 'Escape') return;
        this._modal.hide();
    }
}
