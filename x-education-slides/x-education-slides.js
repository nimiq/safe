import XEducationSlideIntro from './x-education-slide-intro.js';
import XEducationSlideNotABank from './x-education-slide-not-a-bank.js';
import XEducationSlideBlockchain from "./x-education-slide-blockchain.js";
import XEducationSlideWhy from "./x-education-slide-why.js";
import XEducationSlidePointOfNimiq from "./x-education-slide-point-of-nimiq.js";
import XEducationSlidePhishers from "./x-education-slide-phishers.js";
import XEducationSlideScams from "./x-education-slide-scams.js";
import XEducationSlideLoss from "./x-education-slide-loss.js";


export default class XEducationSlides {
    static get slides() {
        return [ XEducationSlideIntro, XEducationSlideNotABank, XEducationSlideBlockchain, XEducationSlideWhy,
            XEducationSlidePointOfNimiq, XEducationSlidePhishers, XEducationSlideScams, XEducationSlideLoss];
    }

    static start() {
        XEducationSlides.currentSlideIndex = 0;
        XEducationSlides.currentSlide.show();
    }

    static resume() {
        XEducationSlides.currentSlide.show();
    }

    static hide() {
        XEducationSlides.currentSlide.hide();
    }

    static next() {
        const nextSlide = XEducationSlides.nextSlide;
        if (nextSlide) {
            nextSlide.show();
        } else {
            XEducationSlides.hide();
        }
    }

    static back() {
        const previousSlide = XEducationSlides.previousSlide;
        if (!previousSlide) return;
        previousSlide.show();
    }

    static get currentSlide() {
        return XEducationSlides.slides[XEducationSlides.currentSlideIndex].instance;
    }

    static get nextSlide() {
        const nextSlide = XEducationSlides.slides[XEducationSlides.currentSlideIndex + 1];
        return nextSlide? nextSlide.instance : null;
    }

    static get previousSlide() {
        const previousSlide = XEducationSlides.slides[XEducationSlides.currentSlideIndex - 1];
        return previousSlide? previousSlide.instance : null;
    }

    static set currentSlide(slide) {
        const index = XEducationSlides.slides.indexOf(slide.constructor);
        if (index < 0) return;
        XEducationSlides.currentSlideIndex = index;
    }

    static get currentSlideIndex() {
        return parseInt(localStorage[XEducationSlides.KEY_CURRENT_SLIDE]) || 0;
    }

    static set currentSlideIndex(index) {
        if (index < 0 || index >= XEducationSlides.slides.length) return;
        localStorage[XEducationSlides.KEY_CURRENT_SLIDE] = index;
        XEducationSlides.currentSlide.show();
        if (index === XEducationSlides.slides.length-1) {
            localStorage[XEducationSlides.KEY_FINISHED] = 'yes';
        }
    }

    static get finished() {
        return localStorage[XEducationSlides.KEY_FINISHED] === 'yes';
    }
}
XEducationSlides.KEY_CURRENT_SLIDE = 'education-slides-current-slide';
XEducationSlides.KEY_FINISHED = 'education-slides-finished';

// TODO lazy loading
