export default class PasteHandler {
    static setDefaultTarget(target, sanitize) {
        if (PasteHandler.listener !== undefined) window.removeEventListener('paste', PasteHandler.listener);
        PasteHandler.listener = PasteHandler._listen.bind(target);
        window.addEventListener('paste', PasteHandler.listener)
    }

    static _listen(e) {
        const activeElement = document.activeElement && document.activeElement.className;
        const isInInput = activeElement === 'input' || activeElement === 'textarea';
        if (isInInput) return;  // We are interested in the case were we're NOT in an input yet
        this.focus();
        e.stopPropagation();
    }
}