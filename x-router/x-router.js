import XElement from '/libraries/x-element/x-element.js';
import Router from '/libraries/es6-router/src/index.js';

export default class XRouter extends XElement {

    onCreate() {
        this.router = new Router();
    }

    __createChild(child) {
        super.__createChild(child);
        console.log(child);
    }
}
