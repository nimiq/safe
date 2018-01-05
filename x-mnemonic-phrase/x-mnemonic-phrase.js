class XMnemonicPhrase extends XElement {
    set privateKey(privateKey) {
        const phrase = MnemonicPhrase.keyToMnemonic(privateKey);
        const words = phrase.split(/\s+/g);

        // Clear existing words
        while(this.$el.firstChild) this.$el.removeChild(this.$el.firstChild);

        words.forEach(word => {
            const $span = document.createElement('span');
            $span.textContent = word;
            const $i = document.createElement('i');
            $i.textContent = String.fromCharCode(160); // non-breakable space
            $span.appendChild($i);
            this.$el.appendChild($span);
        });
    }
}
