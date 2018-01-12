class XMnemonicPhrase extends XElement {
    set privateKey(privateKey) {
        const phrase = MnemonicPhrase.keyToMnemonic(privateKey);
        const words = phrase.split(/\s+/g);

        // Clear existing words
        this.clear();

        words.forEach((word, index) => {
            const $span = document.createElement('span');
            $span.style.animationDelay = (64 * index) + 'ms';

            $span.textContent = word;
            this.$el.appendChild($span);
        });
    }
}