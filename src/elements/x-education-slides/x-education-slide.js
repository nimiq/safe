import XElement from '../../lib/x-element/x-element.js';
import { MixinModalX } from '../mixin-modal/mixin-modal';
import XEducationSlides from './x-education-slides.js';

export default class XEducationSlide extends MixinModalX(XElement) {
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

    onNext() {
        XEducationSlides.next();
    }

    onBack() {
        XEducationSlides.back();
    }

    _onArrowNavigation(e) {
        if (e.keyCode === 37) {
            // left arrow
            this.onBack();
        } else if (e.keyCode === 39) {
            // right arrow
            this.onNext();
        }
    }

    onShow() {
        XEducationSlides.currentSlide = this;
    }
}
