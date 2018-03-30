import XElement from '/libraries/x-element/x-element.js';

export default class XPopupMenu extends XElement {
    html() {
        return `
            <button>
                <i class="material-icons">menu</i>
                <span class="dot-loader display-none"></span>
            </button>
            <div data-x-content></div>
        `
    }

    onCreate() {
        this.$button = this.$('button');
        this.$text = this.$('i');
        this.$loader = this.$('.dot-loader');
        this._noMenu = false;

        this._handleiOS();

        this._bodyClicked = this._bodyClicked.bind(this);
    }

    listeners() {
        return {
            'click button': this._buttonClicked,
        }
    }

    set disabled(disabled) {
        this.$button.disabled = !!disabled;
    }

    set loading(loading) {
        console.log("Setting loading", loading);
        this.$text.classList.toggle('display-none', this._noMenu || !!loading);
        this.$loader.classList.toggle('display-none', !loading);
        this.disabled = this._noMenu || loading;
    }

    set noMenu(noMenu) {
        this._noMenu = !!noMenu;
        this.loading = !this.$loader.classList.contains('display-none'); // Trigger class setting once;
    }

    _buttonClicked(_, e) {
        e.stopPropagation();
        this.$el.classList.add('active');
        document.body.addEventListener('click', this._bodyClicked);
    }

    _bodyClicked(e) {
        this.$el.classList.remove('active');
        document.body.removeEventListener('click', this._bodyClicked);
    }

    _handleiOS() {
        var iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
        if (iOS) {
            document.body.classList.add('is-ios');
        }
    }
}
