class XMnemonicPhrase extends XElement {
    set privateKey(privateKey) {
        const phrase = MnemonicPhrase.keyToMnemonic(privateKey);
        const words = phrase.split(/\s+/g);

        // Clear existing words
        this.clear();

        words.forEach(word => {
            const $span = document.createElement('span');
            $span.textContent = word;
            this.$el.appendChild($span);
        });
    }
}
