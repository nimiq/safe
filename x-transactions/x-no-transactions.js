import XElement from '/libraries/x-element/x-element.js';

export default class XNoTransactions extends XElement {
    html() {
        return `
            <h1 class="material-icons">inbox</h1>
            You have no transactions yet
        `
    }
}
