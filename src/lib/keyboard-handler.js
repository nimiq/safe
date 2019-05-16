export default class KeyboardHandler {
    // Set individual listener. Only one can be active at a time.
    static setGlobalListener(listener) {
        if (KeyboardHandler.listener !== undefined) {
            KeyboardHandler.removeGlobalListener();
        }

        KeyboardHandler.listener = listener;
        self.addEventListener('keypress', KeyboardHandler.listener);
    }

    static removeGlobalListener() {
        self.removeEventListener('keypress', KeyboardHandler.listener);
    }

    static setDefaultTarget(target) {
        KeyboardHandler.setGlobalListener(KeyboardHandler._listen.bind(target));
    }

    // For use with setDefaultTarget
    static _listen(e) {
        if (e.keyCode === 13) return; // enter key

        const activeElement = document.activeElement && document.activeElement.nodeName;
        const isInInput = activeElement === 'INPUT' || activeElement === 'TEXTAREA';

        if (isInInput) return;  // We are interested in the case where we're NOT in an input yet

        e.stopPropagation();
        this.focus();
    }
}