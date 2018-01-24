import XElement from './x-element.js';
export default class XView extends XElement {
    constructor(root) {
        super(root);
        if (!root) this._onShow(); // if this is the root element we call show ourselves
    }

    styles() { return ['x-view'] }

    __fromHtml() {
        super.__fromHtml();
        // this.$el.id = this.__tagName.replace('view-', '');
    }

    _onShow() {
        this.addStyle('x-show');
        this.animateEntry().then(e => this._show());
    }

    _show() {
        this._visible = true;
        if (this.onShow) this.onShow();
    }

    _onHide() {
        this._visible = false;
        document.activeElement.blur();
        this.removeStyle('x-show');
        this.animateExit().then(e => this._hide());
    }

    _hide() {
        if (this.onHide) this.onHide();
    }

    animateEntry() {
        return this.animate('x-entry-animation');
    }

    animateExit() {
        return this.animate('x-exit-animation');
    }

    get visible() { return this._visible }
}