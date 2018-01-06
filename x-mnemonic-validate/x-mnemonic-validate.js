class XMnemonicValidate extends XElement {
    onCreate() {
        this.$slider = new XSlider();
        this.addEventListener('click', e => this._onClick(e));

        // this.reset();


        this.$slide1 = new XMnemonicValidateSlide(this.$('#slide1'));
        this.$slide2 = new XMnemonicValidateSlide(this.$('#slide2'));
        this.$slide3 = new XMnemonicValidateSlide(this.$('#slide3'));

        this.addEventListener('x-mnemonic-word', e => this._onWordSelected(e))
    }

    set privateKey(privateKey) {
        this.mnemonic = MnemonicPhrase.keyToMnemonic(privateKey);
    }

    set mnemonic(mnemonic) {
        this._mnemonic = mnemonic.split(/\s+/g);
    }

    reset(instantly) {
        this._activeSlide = 0;
        this._generateIndices();
        this._setSlideContent(this._activeSlide);
        this._showActiveSlide(instantly);
    }

    _onClick(e) {
        if (e.target.localName !== 'button') return;
        this._onButtonPressed(e.target);
    }

    _generateIndices() {
        this.requiredWords = [
            Math.floor(Math.random() * 8),
            Math.floor(Math.random() * 8) + 8,
            Math.floor(Math.random() * 8) + 16,
        ];
    }

    _generateWords(wordIndex) {
        let words = {};

        words[this._mnemonic[wordIndex]] = wordIndex;

        // Select 8 unique words from the mnemonic phrase
        while (Object.keys(words).length < 8) {
            const index = Math.floor(Math.random() * 24);
            words[this._mnemonic[index]] = index;
        }

        return Object.keys(words).sort();
    }

    _setSlideContent(slideIndex) {
        const words = this._generateWords(this.requiredWords[slideIndex]);
        this.$slider.$slides[slideIndex].innerHTML = this._slideHtml(this.requiredWords[slideIndex], words);
    }

    _showActiveSlide(instantly) {
        if (instantly) this.$slider.jumpTo(this._activeSlide);
        else this.$slider.slideTo(this._activeSlide);
    }

    _next() {
        this._activeSlide++;
        this._setSlideContent(this._activeSlide);
        this._showActiveSlide();
    }

    _isValidWord(wordIndex, word) {
        if (!this._mnemonic) throw new Error('Mnemonic to validate against is not set');

        if (word !== this._mnemonic[wordIndex]) return false;

        return true;
    }

    _onButtonPressed($button) {
        if (!this._isValidWord(this.requiredWords[this._activeSlide], $button.textContent)) {
            this._shake($button);
            setTimeout(() => this.reset(), 1000);
            return;
        }

        this._correct($button);

        if (this._activeSlide === 2) this.fire('validated');
        else setTimeout(() => this._next(), 500);
    }

    _slideHtml(wordIndex, words) {
        return `
            <p>Please select the following word from your phrase:</p>
            <p>#<span>${wordIndex + 1}</span></p>
            <x-wordlist>
                ${ words.map(word => `<button class="small">${word}</button>`).join('') }
            </x-wordlist>
        `;
    }

    _shake($el) {
        $el.classList.add('shake');
        setTimeout(() => $el.classList.remove('shake'), 820);
    }

    _correct($el) {
        $el.classList.add('correct');
    }
}





class XMnemonicValidateSlide extends XElement {

    onCreate() {
        this.$words = this.$$('x-word');
        this.$targetIndex = this.$('x-target-index');
        this.addEventListener('click', e => this._onClick(e))
    }

    set wordlist(wordlist) {
        wordlist.forEach((word, index) => this.$words[index].textContent = word);
    } 

    set targetIndex(index) {
        this.$targetIndex.textContent = index;
    }

    _onClick(e) {
        if (e.target.localName !== 'button') return;
        const word = e.target.textContent;
        this.fire('x-mnemonic-word', {
            slide: this,
            word: word
        });
    }

    html() {
        return `
            <p>Please select the following word from your phrase:</p>
            <x-target-index></x-target-index>
            <x-wordlist>
                <x-word></x-word>
                <x-word></x-word>
                <x-word></x-word>
                <x-word></x-word>
                <x-word></x-word>
                <x-word></x-word>
                <x-word></x-word>
                <x-word></x-word>
            </x-wordlist>
        `
    }
}