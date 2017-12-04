class XApp extends XElement {

    get __tagName() {
        return 'x-app';
    }

    onCreate() {
        window.addEventListener('popstate', () => this._setState());
        this._setState();
    }

    _setState() {
        const state = location.hash.substr(1);
        if (state === '') {
            location = '#home';
            return;
        }
        document.body.className = 'state-' + state;
        this._showView(state);
    }

    _showView(state) {
        const stateCased = state[0].toUpperCase() + state.substring(1);
        const viewName = '$view' + stateCased;
        if (this[viewName] instanceof XElement) {
            document.activeElement.blur();
            if (this.$currView) this.$currView.onHide();
            this.$currView = this[viewName];
            this.$currView.onShow();
        }
    }
}