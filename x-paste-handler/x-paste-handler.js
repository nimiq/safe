import XElement from '/library/x-element/x-element.js';

export default class XPasteHandler extends XElement {
    static setDefaultTarget(target, sanitize){
        if (XPasteHandler.listener !== undefined) window.removeEventListener('paste', XPasteHandler.listener);
        XPasteHandler.listener = XPasteHandler._listen.bind(target);
        XPasteHandler.sanitize = sanitize;
        window.addEventListener('paste', XPasteHandler.listener)
    }

    static _listen(e) {
      if (!(document.activeElement && ['input', 'textarea'].indexOf(document.activeElement.className) != -1)) {
        this.focus();
        e.preventDefault();
        e.stopPropagation();
        const pasted = e.clipboardData.getData('text/plain');
        this.value = XPasteHandler.sanitize(pasted);
      }
    }
}