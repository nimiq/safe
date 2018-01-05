class XMnemonicPhrase extends XElement {

    onCreate() {
        // this.privateKey = 'a18532abfb31ba4e26d64a3ac3430969639aeb5f84b1c4124da0f3e323cdaced';
    }

    set privateKey(privateKey) {
        const phrase = MnemonicPhrase.keyToMnemonic(privateKey);
        const words = phrase.split(' ');
        words.forEach(word => {
            const $el = document.createElement('span');
            $el.innerHTML = word + '<i>&nbsp;</i>';
            this.$el.appendChild($el);
        });
    }
}
