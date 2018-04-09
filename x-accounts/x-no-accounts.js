import XElement from '/libraries/x-element/x-element.js';

export default class XNoAccounts extends XElement {
    html() {
        return `
            <h1 class="material-icons">account_circle</h1>
            Click the <i class="material-icons">add</i> icon to add an account
        `
    }
}
