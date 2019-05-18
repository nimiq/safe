import XElement from '/libraries/x-element/x-element.js';

export default class XExpandable extends XElement {

    html() {
        // the content that goes into this component is expected to have an [expandable-trigger]
        // and an [expandable-content]
        return `
            <div data-x-content></div>
        `;
    }

    onCreate() {
        this._expanded = false;
        this._expandTimeout = null;
        this._collapseTimeout = null;
        this._isDropdown = this.$el.hasAttribute('dropdown');
        this._disabled = this.$el.hasAttribute('disabled');
        this.$content = this.$('[expandable-content]');
        this.$el.addEventListener('click', e => this._onClickToggle(e));
        if (this._isDropdown) {
            // if it is a dropdown, make it closable by a body click
            this.$el.addEventListener('click', e => e.stopPropagation()); // to avoid body click
            this.collapse = this.collapse.bind(this);
        }
        super.onCreate();
    }

    toggle() {
        if (this._expanded) {
            this.collapse();
        } else {
            this.expand();
        }
    }

    expand() {
        if (this._expanded || this._disabled) return;
        this._expanded = true;
        clearTimeout(this._collapseTimeout);
        this.$content.style.display = 'block';
        this.$content.offsetWidth; // style update
        this.$content.style.maxHeight = this.$content.scrollHeight + 'px';
        if (this._isDropdown) {
            document.body.addEventListener('click', this.collapse);
        }
        this._expandTimeout = setTimeout(() => {
            // while expanded remove the max height in case that the content changes in size
            this.$content.style.maxHeight = 'unset';
        }, XExpandable.ANIMATION_TIME);
    }

    collapse() {
        if (!this._expanded || this._disabled) return;
        this._expanded = false;
        clearTimeout(this._expandTimeout);
        // set the start height to transition from
        this.$content.style.maxHeight = this.$content.scrollHeight + 'px';
        this.$content.offsetWidth; // style update
        this.$content.style.maxHeight = '0';
        if (this._isDropdown) {
            document.body.removeEventListener('click', this.collapse);
        }
        this._collapseTimeout = setTimeout(() => {
            this.$content.style.display = 'none';
        }, XExpandable.ANIMATION_TIME);
    }

    disable() {
        this.collapse();
        this._disabled = true;
        this.$el.setAttribute('disabled', '');
    }

    enable() {
        this._disabled = false;
        this.$el.removeAttribute('disabled');
    }

    _onClickToggle(e) {
        // Toggle when clicked on the expandable but not on the content
        let isTargetContent = false;
        let target = e.target;
        while (target) {
            if (target === this.$content) {
                isTargetContent = true;
                break;
            }
            target = target.parentNode;
        }
        if (isTargetContent) return;
        this.toggle();
    }
}
XExpandable.ANIMATION_TIME = 500;
