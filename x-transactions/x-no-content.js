import XElement from '/libraries/x-element/x-element.js';

export default class XNoContent extends XElement {
    html() {
        return `
          No transactions so far 
        `
    }
}
