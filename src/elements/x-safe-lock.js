import XElement from '/libraries/x-element/x-element.js';
import PatternLock from '/libraries/patternLock/patternLock.js';
import XToast from '/secure-elements/x-toast/x-toast.js';

export default class XSafeLock extends XElement {
    html() {
        return `
            <i class="material-icons">locked</i>
            <h1>Your Nimiq Safe is locked</h1>
            <p>Draw your pattern to unlock:</p>
            <div id="unlock-patternLock"></div>
        `
    }

    onCreate() {
        this.lock = new PatternLock(this.$('#unlock-patternLock'), {
            mapper: {1: 3, 2: 8, 3: 4, 4: 2, 5: 9, 6: 7, 7: 5, 8: 1, 9: 6},
            onDraw: this._onEnterPin.bind(this)
        });
    }

    _onEnterPin(pin) {
        pin = this._hash(pin);
        if (pin === localStorage.getItem('lock')) {
            this.destroy();

            // Launch Safe app
            window.safe.launchApp();
        } else {
            this.lock.error();
            setTimeout(this.lock.reset.bind(this.lock), 500);
            this._pin = null;
            XToast.error('Wrong pattern');
        }
    }

    _hash(text) {
        return ('' + text
                .split('')
                .map(c => Number(c.charCodeAt(0)) + 3)
                .reduce((a, e) => a * (1 - a) * this.__chaosHash(e), 0.5))
            .split('')
            .reduce((a, e) => e + a, '')
            .substr(4, 17);
    }

    __chaosHash(number) {
        const k = 3.569956786876;
        let a_n = 1 / number;
        for (let i = 0; i < 100; i++) {
            a_n = (1 - a_n) * a_n * k;
        }
        return a_n;
    }
}
