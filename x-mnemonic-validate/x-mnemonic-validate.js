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
        if (!mnemonic) return;
        this._mnemonic = mnemonic.split(/\s+/g);
        this.init();
    }

    init() {
        this._activeSlide = 0;
        this._generateIndices();
        this._setSlideContent(this._activeSlide);
        this._showActiveSlide();
    }

    reset() {
        if (!this._mnemonic) return;
        this.mnemonic = this._mnemonic.join(' ');
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
        const words = {};

        words[this._mnemonic[wordIndex]] = wordIndex;

        // Select 7 additional unique words from the mnemonic phrase
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

    styles() { return ['x-grow'] }

    onCreate() {
        this.$buttons = this.$$('button');
        this.$targetIndex = this.$('x-target-index');
        this.addEventListener('click', e => this._onClick(e));
    }

    set(wordlist, targetIndex, targetWord) {
        this.$$('.correct').forEach(button => button.classList.remove('correct'));
        this.$$('.wrong').forEach(button => button.classList.remove('wrong'));
        this.setWordlist(wordlist);
        this.setTargetIndex(targetIndex);
        this._targetWord = targetWord;
    }

    setWordlist(wordlist) {
        this._wordlist = wordlist;
        wordlist.forEach((word, index) => this.$buttons[index].textContent = word);
        this.$buttons.forEach(button => button.removeAttribute('disabled'));
    }

    setTargetIndex(index) {
        this.$targetIndex.textContent = index;
    }

    _onClick(e) {
        if (e.target.localName !== 'button') return;
        this._onButtonPressed(e.target);
    }

    _onButtonPressed($button) {
        this.$buttons.forEach(button => button.setAttribute('disabled', 'disabled'));

        if ($button.textContent !== this._targetWord) {
            this._showAsWrong($button);
            const correctButtonIndex = this._wordlist.indexOf(this._targetWord);
            this._showAsCorrect(this.$buttons[correctButtonIndex]);
            this.fire('x-mnemonic-validate-slide', false);
            return;
        }

        this._showAsCorrect($button);
        this.fire('x-mnemonic-validate-slide', true);
    }

    _showAsWrong($el) {
        $el.classList.add('wrong');
        this.animate('shake', $el);
    }

    _showAsCorrect($el) {
        $el.classList.add('correct');
    }
}

// Todo: [Soeren] cleanup animations: use animate api and promises
// Todo: Refactor to use screens instead of slides