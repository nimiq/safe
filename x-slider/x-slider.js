class XSlider extends XElement {
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
        this.slideTo(this._index + 1);
    }

    prev() {
        this.slideTo(this._index - 1);
    }

    slideTo(index) {
        this.$slideContainer.classList.add('animate');
        this._showSlide(index);
    }

    jumpTo(index) {
        this.$slideContainer.classList.remove('animate');
        this._showSlide(index);
    }

    _showSlide(index) {
        index = Math.max(Math.min(index, this.$slides.length - 1), 0);

        const padding = this.$el.offsetWidth * 0.05;
        const center = this.$el.offsetWidth / 2;
        const slideWidth = this.$slides[0].offsetWidth;
        const base = center - slideWidth / 2;

        const offset = base - index * slideWidth - padding - index * 8;

        this.$slideContainer.style.transform = 'translate3d(' + offset + 'px, 0, 0)';

        this.$slides[this._index].classList.remove('active');
        this.$indicators[this._index].removeAttribute('on');
        this._index = index;
        this.$slides[this._index].classList.add('active');
        this.$indicators[this._index].setAttribute('on', 'on');
    }

    _prepareSlides() {
        const $container = document.createElement('x-slide-container');
        for(let i = 0; i < this.$el.getAttribute('slides'); i++) {
            $container.appendChild(document.createElement('x-slide'));
        }
        $container.style.width = this.$el.getAttribute('slides') * 100 + '%';
        this.$el.appendChild($container);
        return $container;
    }

    _prepareIndicators() {
        const $indicator = document.createElement('x-indicator');
        for(let i = 0; i < this.$slides.length; i++) {
            $indicator.appendChild(document.createElement('x-dot'));
        }
        this.$el.appendChild($indicator);
        return $indicator.childNodes;
    }

    _onResize() {
        if(this._resizing) return;
        this._resizing = true;

        window.requestAnimationFrame(() => {
            this.jumpTo(this._index);
            this._resizing = false;
        });
    }
}
