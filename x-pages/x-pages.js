import XElement from "/x-element/x-element.js";

export default class XPages extends XElement {
    onCreate() {
        this._pages = {};
        this._displayNoneHandlers = {};
        this._bindAttributeObserver();

        this._selected = this.$el.getAttribute('selected') || this.default;
        Array.prototype.forEach.call(this.$$('[page]'), page => {
            const pageId = page.getAttribute('page');
            this._pages[pageId] = page;
            if (pageId !== this._selected) {
                this._hide(pageId, false);
            }
        });
        this._show(this._selected, false);
    }

    set selected(pageId) {
        if (!(pageId in this._pages)) {
            pageId = this.default;
        }
        if (pageId === this._selected) {
            return;
        }
        this._hide(this._selected);
        this._show(pageId);
        this._selected = pageId;
        this.$el.setAttribute('selected', pageId);
    }

    get selected() {
        return this._selected;
    }

    get default() {
        let firstPage;
        return this.$el.getAttribute('default') || ((firstPage = this.$('[page]'))? firstPage.getAttribute('page') : '');
    }

    _show(pageId, animate=true) {
        const page = this._pages[pageId];
        this._removeDisplayNoneHandler(pageId);
        page.style.display = '';
        this.stopAnimation(this._animationToUse(page, 'hide'), page);
        if (animate) {
            page.offsetWidth; // style update to remove previous animation before new one starts
            this.animate(this._animationToUse(page, 'show'), page);
        }
        if (page.state && page.state.onShow) {
            page.state.onShow();
        }
    }

    _hide(pageId, animate=true) {
        const page = this._pages[pageId];
        this.stopAnimation(this._animationToUse(page, 'show'), page);
        if (animate) {
            page.offsetWidth; // style update to remove previous animation before new one starts
            this.animate(this._animationToUse(page, 'hide'), page);
            this._bindDisplayNoneHandler(pageId);
        } else {
            page.style.display = 'none';
        }
        if (page.state && page.state.onHide) {
            page.state.onHide();
        }
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

    _animationToUse(page, change='show') {
        return page.getAttribute('animation-'+change)
            || this._toDirectedAnimation(page.getAttribute('animation'), change)
            || this.$el.getAttribute('animation-'+change)
            || this._toDirectedAnimation(this.$el.getAttribute('animation'), change)
            || this._toDirectedAnimation('fade', change);
    }

    _toDirectedAnimation(animation, change='show') {
        if (!animation) {
            return null;
        }
        const suffix = change==='show'? '-in' : '-out';
        return animation + suffix;
    }

    _bindAttributeObserver() {
        const observer = new MutationObserver(mutations => {
            for(const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'selected') {
                    this.selected = this.$el.getAttribute('selected');
                }
            }
        });
        observer.observe(this.$el, {
            attributes: true,
            attributeFilter: ['selected']
        });
    }
}

// Todo: check whether alternating DOM writes / reads in _hide and _show can be better avoided
