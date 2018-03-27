import XElement from '/libraries/x-element/x-element.js';
import MixinModal from '/elements/mixin-modal/mixin-modal.js';

export default class XWelcomeModal extends MixinModal(XElement) {

    html() {
        return `
            <h1>Welcome to Nimiq Safe</h1>
            <a x-href="import-from-file">import account</a>
            <a x-href="new-account">new account</a>
            `
    }
}

// Todo make this a welcome modal
// Todo wording, content of this element
