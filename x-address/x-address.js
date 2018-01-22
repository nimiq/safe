import XElement from '/x-element/x-element.js';

export default class XAddress extends XElement {
    onCreate() {
        this.addEventListener('click', e => this._onCopy())
    }

    _onCopy() {
        
    }
}

// Todo: copy address on click
	// Todo: add x-clipboard singleton
		// Todo: add x-toast