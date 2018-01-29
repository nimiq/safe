import XElement from '/library/x-element/x-element.js';

export default class XKeyboardHandler extends XElement {
    static setDefaultTarget(target, sanitize){
        if (XKeyboardHandler.listener !== undefined)
          window.removeEventListener('keypress', XKeyboardHandler.listener);

        XKeyboardHandler.listener = XKeyboardHandler._listen.bind(target);
        XKeyboardHandler.sanitize = sanitize;
        window.addEventListener('keypress', XKeyboardHandler.listener)
    }

    static _listen(e) {
      const input = e.key;

      if (!(document.activeElement && ['input', 'textarea'].indexOf(document.activeElement.className) != -1)) {
        e.preventDefault();
        e.stopPropagation();
        this.value = XKeyboardHandler.sanitize(this.value + input);
        this.focus();
      }
    }
}