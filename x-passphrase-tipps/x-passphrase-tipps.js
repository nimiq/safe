import XElement from '/libraries/x-element/x-element.js';

export default class XPassphraseTipps extends XElement {
    html() {
        return ` <section>
            <p>Your passphrase becomes stronger:</p>
            <ul>
                <li>
                    the longer it is
                </li>
                <li>
                    if you mix languages, use slang and misspellings
                </li>
                <li>
                    by adding special characters and numbers.
                </li>
            </ul>
        </section>`;
    }
}
