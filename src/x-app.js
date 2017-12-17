class XApp extends XElement {

    get __tagName() { return 'body' }

    get defaultLocation() { return '#home' }

    onCreate() {
        window.addEventListener('popstate', () => this._parseUriFragment());
        this._parseUriFragment();
    }

    _parseUriFragment() {
        const fragment = decodeURIComponent(location.hash.substr(1))
        const path = fragment.split('/');
        const state = path[0];
        if (state === '') return location = this.defaultLocation();
        this._stateChanged(state, path);
    }

    _stateChanged(state, path) {
        document.body.className = 'state-' + state;
        const stateCased = state[0].toUpperCase() + state.substring(1);
        const viewName = '$view' + stateCased;
        if (!(this[viewName] instanceof XElement)) return;
        document.activeElement.blur();
        if (this.$currView) this.$currView.onHide();
        this.$currView = this[viewName];
        this.$currView.onShow();
    }
}