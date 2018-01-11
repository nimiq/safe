class XApp extends XElement {

    get __tagName() { return 'body' }

    get defaultLocation() { return '#home' }

    onCreate() {
        window.addEventListener('popstate', () => this._onFragmentChanged());
        this._bindListeners();
        this._onFragmentChanged();
    }

    __createChild(child) { 
        const $child = new child(this);
        this[child.__toChildName()] = $child;
        if (!$child.__tagName.startsWith('view-')) return
        $child.$el.id = $child.__tagName.replace('view-', '');
    }

    _bindListeners() {
        if (!this.listeners) return;
        const listeners = this.listeners();
        for (const key in listeners) {
            this.addEventListener(key, e => this[listeners[key]](e.detail !== undefined ? e.detail : e));
        }
    }

    _onFragmentChanged() {
        const fragment = decodeURIComponent(location.hash.substr(1))
        const path = fragment.split('/');
        const state = path[0];
        if (state === '') return location = this.defaultLocation;
        this._onStateChanged(state, path);
    }

    _onStateChanged(state, path) {
        document.body.className = 'state-' + state;
        const stateCased = state[0].toUpperCase() + state.substring(1);
        const viewName = '$view' + stateCased;
        if (!(this[viewName] instanceof XElement)) return;
        document.activeElement.blur();
        if (this.$currView && this.$currView.onHide) this.$currView.onHide();
        this.$currView = this[viewName];
        if (this.$currView.onShow) this.$currView.onShow();
    }

}