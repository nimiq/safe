import XElement from '/libraries/x-element/x-element.js';

export default class XClose extends  XElement {
    onEntry() {
        self.close();
    }
}