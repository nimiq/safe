import XElement from "/library/x-element/x-element.js";

export default class XSlides extends XElement {
    html() {
        return `
            <x-slide-container content></x-slide-container>
            <x-indicator></x-indicator>
        `
    }

    onCreate() {
        this.$slideContainer = this._prepareSlides();
        this.$slides = this.$slideContainer.childNodes;
        this.$indicators = this._prepareIndicators();

        window.addEventListener('resize', this._onResize.bind(this));

        this._index = 0;
        window.setTimeout(() => {
            this.jumpTo(this._index);
        }, 0);
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
            this.$slideContainer.classList.add('animate');
            this._showSlide(index);
            setTimeout(resolve, 500);
        })
    }

    jumpTo(index) {
        this.$slideContainer.classList.remove('animate');
        this._showSlide(index);
    }

    _showSlide(index) {
        index = Math.max(Math.min(index, this.$slides.length - 1), 0);

        const center = this.$el.offsetWidth / 2;
        const slideWidth = this.$slides[0].offsetWidth;
        const base = center - slideWidth / 2;

        const offset = base - index * slideWidth - index * 8;

        this.$slideContainer.style.transform = 'translate3d(' + offset + 'px, 0, 0)';

        this.$slides[this._index].classList.remove('active');
        this.$indicators[this._index].removeAttribute('on');
        this._index = index;
        this.$slides[this._index].classList.add('active');
        this.$indicators[this._index].setAttribute('on', 'on');
    }

    _prepareSlides() {
        const $container = this.$('x-slide-container');
        $container.childNodes.forEach(child => {
            if (child instanceof Text && child.textContent.trim() == '') child.remove();
        })
        const slidesCount = $container.childElementCount;
        $container.style.width = slidesCount * 100 + '%';
        return $container;
    }

    _prepareIndicators() {
        const $indicator = this.$('x-indicator');
        for (let i = 0; i < this.$slides.length; i++) {
            $indicator.appendChild(document.createElement('x-dot'));
        }
        return $indicator.childNodes;
    }

    _onResize() {
        if (this._resizing) return;
        this._resizing = true;

        window.requestAnimationFrame(() => {
            this.jumpTo(this._index);
            this._resizing = false;
        });
    }
}