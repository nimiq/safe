import XElement from '/library/x-element/x-element.js';
import XSlides from '../x-slides/x-slides.js';
import XSuccessMark from '../x-success-mark/x-success-mark.js';
import MnemonicPhrase from '/library/mnemonic-phrase/mnemonic-phrase.es6.min.js';

export default class XMnemonicValidate extends XElement {
    html() {
        return `
            <x-slides>
                <x-mnemonic-validate-slide></x-mnemonic-validate-slide>
                <x-mnemonic-validate-slide></x-mnemonic-validate-slide>
                <x-mnemonic-validate-slide></x-mnemonic-validate-slide>
                <x-slide>
                    <x-success-mark></x-success-mark>
                    <h2>Phrase Validated</h2>
                </x-slide>
            </x-slides>
            `
    }

    children() {
        return [XSlides, [XMnemonicValidateSlide], XSuccessMark];
    }

    onCreate() {
        this.$mnemonicValidateSlides.forEach(slide => {
            slide.addEventListener('x-mnemonic-validate-slide', e => this._onSlideEvent(e.detail));
        });
    }

    set privateKey(privateKey) {
        this.mnemonic = MnemonicPhrase.keyToMnemonic(privateKey);
    }

    set mnemonic(mnemonic) {
        this._mnemonic = mnemonic.split(/\s+/g);
        this.init();
    }

    init() {
        this._activeSlide = 0;
        this._generateIndices();
        this._setSlideContent(this._activeSlide);
        this._showActiveSlide();
    }

    reset(){
        this.mnemonic = this._mnemonic;
    }

    resetSlide() {
        this.requiredWords[this._activeSlide] = this._generateIndex(this._activeSlide);
        this._setSlideContent(this._activeSlide);
    }

    _next() {
        this._activeSlide += 1;
        if (this._activeSlide < 3) this._setSlideContent(this._activeSlide);
        else setTimeout(() => this.$successMark.animate(), 300);
        this._showActiveSlide();
    }

    _onSlideEvent(valid) {
        if (!valid) setTimeout(() => this.resetSlide(), 820);
        else {
            if (this._activeSlide === 2) this._success();
            setTimeout(() => this._next(), 500);
        }
    }

    _success() {
        setTimeout(e => this.fire('x-phrase-validated'), 2500);
    }

    _generateIndices() {
        this.requiredWords = [0, 1, 2].map(this._generateIndex);
    }

    _generateIndex(index) {
        return Math.floor(Math.random() * 8) + index * 8;
    }

    _setSlideContent(slideIndex) {
        this.$mnemonicValidateSlides[slideIndex].set(
            this._generateWords(this.requiredWords[slideIndex]), // wordlist
            this.requiredWords[slideIndex] + 1, // targetIndex
            this._mnemonic[this.requiredWords[slideIndex]] // targetWord
        );
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

    _showActiveSlide() {
        this.$slides.slideTo(this._activeSlide);
    }
}

class XMnemonicValidateSlide extends XElement {
    html() {
        return `
            <p>Please select the following word from your phrase:</p>
            <x-target-index></x-target-index>
            <x-wordlist>
                <button class="small"></button>
                <button class="small"></button>
                <button class="small"></button>
                <button class="small"></button>
                <button class="small"></button>
                <button class="small"></button>
                <button class="small"></button>
                <button class="small"></button>
            </x-wordlist>`;
    }

    onCreate() {
        this.$buttons = this.$$('button');
        this.$targetIndex = this.$('x-target-index');
        this.addEventListener('click', e => this._onClick(e));
    }

    set(wordlist, targetIndex, targetWord) {
        this.$buttons.forEach(button => button.classList.remove('correct'));
        this.wordlist = wordlist;
        this.targetIndex = targetIndex;
        this.targetWord = targetWord;
    }

    set wordlist(wordlist) {
        wordlist.forEach((word, index) => this.$buttons[index].textContent = word);
        this.$buttons.forEach(button => button.removeAttribute('disabled'));
    }

    set targetIndex(index) {
        this.$targetIndex.textContent = index;
    }

    _onClick(e) {
        if (e.target.localName !== 'button') return;
        this._onButtonPressed(e.target);
    }

    _onButtonPressed($button) {
        this.$buttons.forEach(button => button.setAttribute('disabled', 'disabled'));

        if (this.targetWord !== $button.textContent) {
            this._shake($button);
            this.fire('x-mnemonic-validate-slide', false);
            return;
        }

        this._correct($button);
        this.fire('x-mnemonic-validate-slide', true);
    }

    _shake($el) {
        $el.classList.add('shake');
        setTimeout(() => $el.classList.remove('shake'), 820);
    }

    _correct($el) {
        $el.classList.add('correct');
    }
}

// Todo: on wrong attempt: shake and show correct one as correct
// Todo: use animate method for shake animation
