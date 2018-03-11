import XElement from '/libraries/x-element/x-element.js';

export default class XAppScreen extends XElement {

    /** @param {XAppScreen} instance */
    static set instance(instance) {
        this._instance = instance;
    }

    static launch() { window.addEventListener('load', () => new this()); }

    constructor() {
        super();
        this.state = {
            /** @type {string?} */
            error: null
        }
        XAppScreen.instance = this;
    }

    get __tagName() { return 'body' }

    _animateEntry() {} // Overwritten from XScreenFit

    showError(message, linkTarget = null, linkText = null) {
        if (this.state.error) return;
        this.state.error = message;

        if (this.$screenError) {
            this.$screenError.show(this.state.error);

            if (linkTarget && linkText) this.$screenError.setLink(linkTarget, linkText);
            else this.$screenError.removeLink();

            location = '#error';
        }
    }

    /**
     *
     * @param {XState} nextState
     * @param {XState} prevState
     * @param {boolean} isNavigateBack
     * @returns {Promise<void>}
     * @private
     */
    async _onRootStateChange(nextState, prevState, isNavigateBack) {
        if (this.state.error && nextState.leafId !== 'error') return;
        nextState = this._sanitizeState(nextState);
        const intersection = nextState.intersection(prevState); // calc intersection common parent path
        const nextStateDiff = nextState.difference(prevState);
        const prevStateDiff = prevState && prevState.difference(nextState);
        let parent = this;
        intersection.forEach(childId => parent = parent._getChildScreen(childId)); // decent common path
        let exitParent = prevStateDiff && parent._getChildScreen(prevStateDiff[0]);
        if (exitParent) exitParent._exitScreens(prevStateDiff, nextState, prevState, isNavigateBack);
        parent._entryScreens(nextStateDiff, nextState, prevState, isNavigateBack);
        if (parent._onStateChange) parent._onStateChange(nextState);
    }
}