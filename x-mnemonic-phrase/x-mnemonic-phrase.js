import XElement from '/libraries/x-element/x-element.js';
import MnemonicPhrase from '/libraries/mnemonic-phrase/mnemonic-phrase.es6.min.js';

export default class XMnemonicPhrase extends XElement {

    styles() { return ['x-recovery-phrase'] }

    set privateKey(privateKey) {
        const phrase = MnemonicPhrase.keyToMnemonic(privateKey);
        const words = phrase.split(/\s+/g);

        // Clear existing words
        this.clear();

        words.forEach((word, index) => {
            const $span = document.createElement('span');
            $span.className = 'x-word';
            $span.title = 'word #' + (index + 1);
            $span.style.animationDelay = (700 + 64 * index) + 'ms';

            $span.textContent = word;
            this.$el.appendChild($span);
        });
    }

    animateEntry() {
        this.addStyle('x-entry');
        setTimeout(() => {
            this.removeStyle('x-entry')
        }, 4000);
    }
}