import XElement from '/libraries/x-element/x-element.js';
import MixinSingleton from '../mixin-singleton/mixin-singleton.js';

export default class XModals extends MixinSingleton(XElement) {
    onCreate() {
        super.onCreate();
        this._visibleModal = null;
        this._hideTimer = null;
        this._isSwitchingModal = false;
        this._hideRequested = false;
        this._switchHistory = [];
    }

    static show(modal) {
        this.instance._show(modal);
    }

    _show(modal) {
        if (modal === null || modal === this._visibleModal || !modal.allowsShow()
            || (this._visibleModal && !this._visibleModal.allowsHide())) return;
        clearTimeout(this._hideTimer);

        // show background
        this.$el.style.display = 'block';
        this.$el.offsetWidth; // style update
        this.$el.style.background = 'rgba(0,0,0,0.3)';

        // check whether we're switching modals (i.e. there is another modal to be hidden)
        this._isSwitchingModal = !!this._visibleModal || this._hideRequested;
        this._isSwitchingBack = this._isSwitchingModal && this._switchHistory.length>=2
            && this._switchHistory[this._switchHistory.length-2] === modal;
        if (!this._isSwitchingModal) this._switchHistory = [];

        // Hide currently visible modal if necessary.
        let waitTime = 0;
        // TODO this can be simplified if the router always calls all the onEntries before the onExits
        // If hiding of the previous modal isn't handled by the router, we have to do it manually. However, if the
        // router handles it, we won't trigger the hiding manually to avoid adding an entry for the hide call to the
        // browser history. As the router might call the hide after the show, we have to wait a little bit to see it
        if (this._visibleModal && !this._hideRequested) {
            setTimeout(() => {
                if (this._hideRequested) return;
                // modal apparently wasn't closed by the router
                this._visibleModal.hide();
            }, 30);
            waitTime = 35;
        }

        // show new modal
        setTimeout(() => {
            this._visibleModal = modal;
            if (this._isSwitchingBack) {
                this._switchHistory.pop();
            } else {
                this._switchHistory.push(modal);
            }
            modal.container.animateShow(this._isSwitchingModal, this._isSwitchingBack);
            modal.onShow();
            // Delay resetting the switching flag for the case that hide gets invoked before show and then waits
            // to determine whether we are switching
            // XXX will probably lead to problems on frequent calls.
            setTimeout(() => {
                this._isSwitchingModal = false;
                this._isSwitchingBack = false;
            }, 40 - waitTime);
        }, waitTime);
    }

    static hide(modal) {
        this.instance._hide(modal);
    }

    _hide(modal = this._visibleModal) {
        if (modal === null || modal !== this._visibleModal || !modal.allowsHide()) return;
        this._hideRequested = true;

        // If _isSwitchingModal isn't true anyways, wait a little bit so see whether the _hide gets followed by a
        // _show which would then set _isSwitchingModal
        const waitTime = this._isSwitchingModal? 0 : 30;

        setTimeout(() => {
            if (!this._isSwitchingModal) {
                this._visibleModal = null;
                this.$el.style.background = 'rgba(0,0,0,0)';
                this._hideTimer = setTimeout(() => this.$el.style.display = 'none', XModals.ANIMATION_TIME);
            }
            modal.container.animateHide(this._isSwitchingModal, this._isSwitchingBack);
            modal.onHide();
            this._hideRequested = false;
        }, waitTime);
    }

    static isVisible(instance) {
        return this.instance._visibleModal === instance;
    }
}
XModals.ANIMATION_TIME = 400;
