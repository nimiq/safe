import XElement from '/libraries/x-element/x-element.js';

export default class XSafeStart extends XElement {

    html() {
        return `
            <h1>Welcome to Nimiq Safe</h1>
            No accounts present? Show introduction and:
            <a x-href="import-from-file">import account</a>
            <a x-href="new-account">new account</a>
            `
    }
}

// Todo make this a welcome modal
// Todo wording, content of this element
