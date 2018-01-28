import XElement from "/library/x-element/x-element.js";

export default class XPages extends XElement {
    onCreate() {
        this._pages = {};
        this._displayNoneHandlers = {};
        this._selected = this.$el.getAttribute('selected') || this.default;
        this.$$('[page]').forEach(page => this._initPage(page));
        this._show(this._selected, false);
    }

    _initPage(page) {
        const pageId = page.getAttribute('page');
        this._pages[pageId] = page;
        if (pageId !== this._selected) this._hide(pageId, false);
    }

    set selected(pageId) {
        this.select(pageId);
    }

    get selected() {
        return this._selected;
    }

    get default() {
        const defaultPage = this.$el.getAttribute('default');
        if (defaultPage) return defaultPage;
        const firstPage = this.$('[page]');
        if (firstPage) return firstPage.getAttribute('page');
    }

    select(pageId, animate = true) {
        if (!(pageId in this._pages)) pageId = this.default; // if pageId doesn't exist we use default page
        if (pageId === this._selected) return; // state didn't change. nothing to do
        this._hide(this._selected, animate); // hide previous
        this._show(pageId, animate); // show next 
    }

    _show(pageId, animate = true) {
        const page = this._pages[pageId];
        this._removeDisplayNoneHandler(pageId);
        page.style.display = '';
        this._stopAnimatePage(page, 'hide');
        this._selected = pageId; // update selected
        this.$el.setAttribute('selected', pageId); // reflect state to attribute 
        if (animate) this._animatePage(page, 'show');
    }

    _hide(pageId, animate = true) {
        const page = this._pages[pageId];
        this._stopAnimatePage(page, 'show');
        if (animate) {
            this._animatePage(page, 'hide');
            this._bindDisplayNoneHandler(pageId);
        } else {
            page.style.display = 'none';
        }
    }

    _animatePage(page, animation) {
        page.offsetWidth; // style update to remove previous animation before new one starts
        return this.animate(this._animationToUse(page, animation), page)
    }

    _stopAnimatePage(page, animation) {
        this.stopAnimate(this._animationToUse(page, animation), page)
    }

    _bindDisplayNoneHandler(pageId) {
        const page = this._pages[pageId];
        this._displayNoneHandlers[pageId] = () => {
            page.style.display = 'none';
            this._removeDisplayNoneHandler(pageId);
        };
        page.addEventListener('animationend', this._displayNoneHandlers[pageId]);
    }

    _removeDisplayNoneHandler(pageId) {
        const page = this._pages[pageId];
        page.removeEventListener('animationend', this._displayNoneHandlers[pageId]);
        this._displayNoneHandlers[pageId] = null;
    }

    _animationToUse(page, change = 'show') {
        return page.getAttribute('animation-' + change) ||
            this._toDirectedAnimation(page.getAttribute('animation'), change) ||
            this.$el.getAttribute('animation-' + change) ||
            this._toDirectedAnimation(this.$el.getAttribute('animation'), change) ||
            this._toDirectedAnimation('fade', change);
    }

    _toDirectedAnimation(animation, change = 'show') {
        if (!animation) return null;
        const suffix = change === 'show' ? '-in' : '-out';
        return animation + suffix;
    }
}

// Todo: [low] [Daniel] check whether alternating DOM writes & reads in _hide and _show can be better avoided

/*

Page States
    - invisible (default)
    - visible 
    - entry 
    - entry-reverse 
    - exit
    - exit-reverse

*/