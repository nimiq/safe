import XElement from '/libraries/x-element/x-element.js';

export default class XSafe extends XElement {

    html() {
        return `
            <h1>Welcome to Nimiq Safe</h1>
            <x-switch>
                <x-variant>
                    No accounts present? Show introduction and:
                    <a x-href="import-from-file">import account</a>
                    <a x-href="new-account">new account</a>
                 </x-variant>
                 <x-variant>
                     otherwise show what?
                </x-variant>
            </x-switch>
            `
    }
}



// Todo make switch work
// Todo wording, content of this element
