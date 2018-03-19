import XElement from '/libraries/x-element/x-element.js';

export default class XNoContent extends XElement {
    html() {
        return `
          Click above to add an account
        `
    }
}
