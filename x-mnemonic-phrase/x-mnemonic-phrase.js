import XElement from '/libraries/x-element/x-element.js';
import MnemonicPhrase from '/libraries/mnemonic-phrase/mnemonic-phrase.min.js';

export default class XMnemonicPhrase extends XElement {

    styles() { return ['x-recovery-phrase'] }

    _onPropertiesChanged(changes) {
        if (changes.privateKey) {
            this.privateKey = changes.privateKey;
        }
    }

    set privateKey(privateKey) {
        const phrase = MnemonicPhrase.keyToMnemonic(privateKey);
        const words = phrase.split(/\s+/g);

        // TODO: [low] Reactive animation of each word via initial delay

        // Clear existing words
        this.clear();

        const html = words.map((word, index) => `<div class="x-word">
            <span class="x-index">${index + 1}</span>
            <span class="x-word-content" title="word # ${index + 1}">${word}</span>
        </div>`).reduce((a,b) => a.concat(b));

        // TODO: [low] Replace by document.createElement to avoid risk of injection. OR just activate CSP
        this.$el.innerHTML = html;
    }

    animateEntry() {
        this.addStyle('x-entry');
        setTimeout(() => {
            this.removeStyle('x-entry')
        }, 4000);
    }
}
