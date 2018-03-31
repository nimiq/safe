import XElement from '/libraries/x-element/x-element.js';
import MixinModal from '../mixin-modal/mixin-modal.js';
import XEducationSlides from './x-education-slides.js';
import XToast from '/secure-elements/x-toast/x-toast.js';

export default class XEducationSlide extends MixinModal(XElement) {
    onCreate() {
        super.onCreate();
        this.$nextButton = this.$('[next]');
        if (this.$nextButton) {
            this.$nextButton.addEventListener('click', XEducationSlides.next);
        }
        this.$backButton = this.$('[back]');
        if (this.$backButton) {
            this.$backButton.addEventListener('click', XEducationSlides.back);
        }
        this.container.addEventListener('keydown', e => this._onArrowNavigation(e));
    }

    styles() {
        return [...super.styles(), 'x-education-slide'];
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
        if (XEducationSlides.finished
            || (incomingModal && (XEducationSlides.nextSlide === incomingModal
            || XEducationSlides.previousSlide === incomingModal))) return true;
        XToast.warn('Please read through this important information.');
        return false;
    }

    onShow() {
        XEducationSlides.currentSlide = this;
    }
}
