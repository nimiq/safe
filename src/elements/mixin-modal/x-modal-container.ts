import XElement from '../../lib/x-element/x-element';

export default class XModalContainer extends XElement {
    public static createFor(modal: any) {
        const parent = modal.$el.parentNode;
        let modalContainer;
        if (parent && parent.nodeName.toLowerCase() === 'x-modal-container') {
            modalContainer = new XModalContainer(parent);
        } else {
            modalContainer = XModalContainer.createElement();
        }
        modalContainer._modal = modal;
        return modalContainer;
    }

    private static ANIMATION_TIME = 400;
    private _modal: any;
    private _hideTimer?: number;

    public animateShow(isSwitching: boolean, isSwitchingBack: boolean) {
        clearTimeout(this._hideTimer);
        this.$el.style.display = 'flex';
        this._modal.$el.style.animationName = null;
        // tslint:disable:no-unused-expression
        this.$el.offsetWidth; // style update
        this._modal.$el.offsetWidth; // style update
        // tslint:enable:no-unused-expression
        this.$el.focus();
        this.$el.style.zIndex = '1';
        this._modal.$el.style.animationDelay = isSwitching ? XModalContainer.ANIMATION_TIME / 2 + 'ms' : '0s';
        this._modal.$el.style.animationDirection = 'normal';
        this._modal.$el.style.animationName = !isSwitching ? 'grow, fade'
            : isSwitchingBack ? 'from-left   ' : 'from-right';
    }

    public animateHide(isSwitching: boolean, isSwitchingBack: boolean) {
        this._modal.$el.style.animationName = null;
        // tslint:disable:no-unused-expression
        this.$el.offsetWidth; // style update
        this._modal.$el.offsetWidth; // style update
        // tslint:enable:no-unused-expression
        this.$el.blur();
        this.$el.style.zIndex = '0';
        this._modal.$el.style.animationDelay = '0s';
        this._modal.$el.style.animationDirection = 'reverse';
        this._modal.$el.style.animationName = !isSwitching ? 'grow, fade'
            : isSwitchingBack ? 'from-right' : 'from-left';
        this._hideTimer = window.setTimeout(() => this.$el.style.display = 'none', XModalContainer.ANIMATION_TIME);
    }

    protected onCreate() {
        super.onCreate();
        this._modal = null;
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
