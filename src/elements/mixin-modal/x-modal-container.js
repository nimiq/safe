import XElement from '/libraries/x-element/x-element.js';

export default class XModalContainer extends XElement {
    onCreate() {
        super.onCreate();
        this._modal = null;
        this._hideTimer = null;
        this.$el.setAttribute('tabindex', '-1');
        this.$el.addEventListener('click', e => this._onBackdropClick(e));
        this.$el.addEventListener('keydown', e => this._onEscape(e));
    }

    static createFor(modal) {
        let parent = modal.$el.parentNode;
        let modalContainer;
        if (parent && parent.nodeName.toLowerCase() === 'x-modal-container') {
            modalContainer = new XModalContainer(parent);
        } else {
            modalContainer = XModalContainer.createElement();
        }
        modalContainer._modal = modal;
        return modalContainer;
    }

    animateShow(isSwitching, isSwitchingBack) {
        clearTimeout(this._hideTimer);
        this.$el.style.display = 'flex';
        this._modal.$el.style.animationName = null;
        this.$el.offsetWidth; // style update
        this._modal.$el.offsetWidth; // style update
        this.$el.focus();
        this.$el.style.zIndex = 1;
        this._modal.$el.style.animationDelay = isSwitching? XModalContainer.ANIMATION_TIME / 2 + 'ms' : '0s';
        this._modal.$el.style.animationDirection = 'normal';
        this._modal.$el.style.animationName = !isSwitching? 'grow, fade'
            : isSwitchingBack? 'from-left   ' : 'from-right';
    }

    animateHide(isSwitching, isSwitchingBack) {
        this._modal.$el.style.animationName = null;
        this.$el.offsetWidth; // style update
        this._modal.$el.offsetWidth; // style update
        this.$el.blur();
        this.$el.style.zIndex = 0;
        this._modal.$el.style.animationDelay = '0s';
        this._modal.$el.style.animationDirection = 'reverse';
        this._modal.$el.style.animationName = !isSwitching? 'grow, fade'
            : isSwitchingBack? 'from-right' : 'from-left';
        this._hideTimer = setTimeout(() => this.$el.style.display = 'none', XModalContainer.ANIMATION_TIME);
    }

    _onBackdropClick(e) {
        if (e.target !== this.$el) return; // clicked on a child
        this._modal.hide();
    }

    _onEscape(e) {
        if (e.keyCode !== 27) return; // other key than escape
        this._modal.hide();
    }
}
XModalContainer.ANIMATION_TIME = 400;
