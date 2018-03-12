import XElement from '/libraries/x-element/x-element.js';

export default class XApp extends XElement {

    static launch() { window.addEventListener('load', () => new this()); }

    get __tagName() { return 'body' }
}