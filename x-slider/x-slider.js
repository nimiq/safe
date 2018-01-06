class XSlider extends XElement {
    onCreate() {
        this.$slideContainer = this.$('x-slide-container');
        this.$slides = this.$el.querySelectorAll('x-slide');

        this.$slideContainer.style.width = this.$slides.length * 100 + '%';

        window.addEventListener('resize', this._onResize.bind(this));

        this._index = 0;

        this.$indicators = this._prepareIndicators();

        window.setTimeout(() => {
            this.jumpTo(this._index);
        }, 0);
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

    _prepareIndicators() {
        const $indicator = document.createElement('x-indicator');
        for(let i = 0; i < this.$slides.length; i++) $indicator.appendChild(document.createElement('x-dot'));
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
