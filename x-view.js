class XView extends XElement {

    styles() { return ['x-view'] }

    __fromHtml() {
        super.__fromHtml();
        this.$el.id = this.__tagName.replace('view-', '');
    }

    _onShow() {
        this.animateEntry();
        if (this.onShow) this.onShow();
    }

    _onHide() {
        document.activeElement.blur();
        this.animateExit();
        if (this.onHide) this.onHide();
    }

    animateEntry() {
        this.animate('x-view-entry');
    }

    animateExit() {
        this.animate('x-view-exit');
    }
}