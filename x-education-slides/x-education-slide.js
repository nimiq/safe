import XElement from '/libraries/x-element/x-element.js';
import MixinModal from '../mixin-modal/mixin-modal.js';
import XEducationSlides from './x-education-slides.js';
import XToast from '/secure-elements/x-toast/x-toast.js';
import XWelcomeModal from '/apps/safe/src/elements/x-welcome-modal.js';

export default class XEducationSlide extends MixinModal(XElement) {
    onCreate() {
        super.onCreate();
        this.$nextButton = this.$('[next]');
        if (this.$nextButton) {
            this.$nextButton.addEventListener('click', this.onNext.bind(this));
        }
        this.$backButton = this.$('[back]');
        if (this.$backButton) {
            this.$backButton.addEventListener('click', this.onBack.bind(this));
        }
        this.container.addEventListener('keydown', e => this._onArrowNavigation(e));
    }

    styles() {
        return [...super.styles(), 'x-education-slide'];
    }

    onNext() {
        XEducationSlides.next();
    }

    onBack() {
        XEducationSlides.back();
    }

    _onArrowNavigation(e) {
        if (e.keyCode === 37) {
            // left arrow
            XEducationSlides.back();
        } else if (e.keyCode === 39) {
            // right arrow
            XEducationSlides.next();
        }
    }

    allowsHide(incomingModal) {
        if (incomingModal
            && (incomingModal === XEducationSlides.nextSlide || incomingModal === XEducationSlides.previousSlide
            || incomingModal === XWelcomeModal.instance)
        ) {
            return true;
        }

        XToast.warn('Please read through this important information.');

        return false;
    }

    onShow() {
        XEducationSlides.currentSlide = this;
    }
}
