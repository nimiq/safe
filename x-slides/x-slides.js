import XElement from "/library/x-element/x-element.js";

export default class XSlides extends XElement {
    html() {
        return `
            <x-slide-container content></x-slide-container>
            <x-indicator></x-indicator>
        `
    }

    onCreate() {
        this._index = 0;
        this._prepareSlides();
        this._prepareIndicators();
        window.addEventListener('resize', e => this._onResize(e));
        requestAnimationFrame(e => this.jumpTo(this._index));
    }

    get slides() {
        return this.$slides;
    }

    next() {
        return this.slideTo(this._index + 1);
    }

    prev() {
        return this.slideTo(this._index - 1);
    }

    slideTo(index) {
        return new Promise(resolve => {
            this.$slideContainer.classList.add('x-animate-slide');
            this._showSlide(index);
            setTimeout(resolve, 600);
        })
    }

    jumpTo(index) {
        this.$slideContainer.classList.remove('x-animate-slide');
        this._showSlide(index);
    }

    _showSlide(index) {
        index = Math.max(Math.min(index, this.$slides.length - 1), 0);
        const width = this.$el.offsetWidth;
        const offset = (-width) * index;

        this.$slideContainer.style.transform = 'translateX(' + offset + 'px)';

        this.$slides[this._index].classList.remove('active');
        this.$indicators[this._index].removeAttribute('on');
        this._index = index;
        this.$slides[this._index].classList.add('active');
        this.$indicators[this._index].setAttribute('on', 'on');
    }

    _prepareSlides() {
        this.$slideContainer = this.$('x-slide-container');
        this.$slides = this.$slideContainer.childNodes;
        this._cleanupDom();
        this._setSlideWidth();
    }

    _cleanupDom(slides){
        // delete all children that are empty text nodes
        const filter = node => {
            if (node instanceof Text && node.textContent.trim() == '') node.remove();
        }
        this.$slides.forEach(filter);
    }

    _setSlideWidth() {
        const slidesCount = this.$slideContainer.childElementCount;
        const width = this.$el.offsetWidth;
        this.$slideContainer.style.width = slidesCount * width + 'px';
        this.$slides.forEach(slide => slide.style.width = width + 'px');
    }

    _prepareIndicators() {
        const $indicator = this.$('x-indicator');
        for (let i = 0; i < this.$slides.length; i++) {
            $indicator.appendChild(document.createElement('x-dot'));
        }
        this.$indicators = $indicator.childNodes;
    }

    _onResize() {
        if (this._resizing) return;
        this._resizing = true;
        window.requestAnimationFrame(e => this._resize());
    }

    _resize() {
        this._setSlideWidth()
        this.jumpTo(this._index);
        this._resizing = false;
    }
}