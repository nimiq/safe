(function () {

    function isWebApp() {
      var isIOSWebApp = (window.navigator.standalone === true);
      var isChromeWebApp = (window.matchMedia('(display-mode: standalone)').matches);

      return isIOSWebApp || isChromeWebApp;
    }

    function isWebView() {
        if (isWebApp()) {
          return false;
        }

        var userAgent = navigator.userAgent;

        if ((typeof navigator.mediaDevices === 'undefined'
            || typeof navigator.mediaDevices.getUserMedia === 'undefined')
            // iOS Chrome is a Web View (or at least doesn't support media devices), but still a browser
            && !/CriOS/i.test(userAgent)) return true;

        var inAppBrowsers = ['FB_IAB', 'Instagram'];

        for (var i = 0; i < inAppBrowsers.length; i++) {
            if (userAgent.indexOf(inAppBrowsers[i]) > -1) {
                return true;
            }
        }

        return false;
    }

    function isBrowserOutdated() {
        if (typeof Symbol === "undefined") return true;
        try {
            eval("class Foo {}");
            eval("var bar = async (x) => x+1");
        } catch (e) {
            return true;
        }
        return isOutdatedIos();
    }

    function isOutdatedIos() {
        if (!/iP(hone|od|ad)/.test(navigator.platform)) return false;
        var version = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
        version = [parseInt(version[1], 10), parseInt(version[2], 10), parseInt(version[3] || 0, 10)];
        return version[0] < 11 || (version[0] === 11 && (version[1] <= 2));
    }

    function isEdge() {
        return navigator.userAgent.indexOf('Edge') !== -1;
    }

    function isChrome() {
        return navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
    }

    function isSafari() {
        return (
            /Constructor/.test(window.HTMLElement) ||
            (function (root) {
                return (!root || root.pushNotification).toString() === '[object SafariRemoteNotification]';
            }
            )(window.safari)
        );
    }

    /**
     * Detect if the browser is running in Private Browsing mode
     *
     * @returns {Promise}
     */
    function isPrivateMode() {
        return new Promise(function (resolve) {
            const on = function () { resolve(true) }; // is in private mode
            const off = function () { resolve(false) }; // not private mode
            // Chrome & Opera
            if (window.webkitRequestFileSystem) {
                return void window.webkitRequestFileSystem(0, 0, off, on);
            }
            // Firefox
            if ('MozAppearance' in document.documentElement.style) {
                const db = indexedDB.open(null);
                db.onerror = on;
                db.onsuccess = off;
                return void 0;
            }
            // Safari
            if (isSafari()) {
                try {
                    window.openDatabase(null, null, null, null);
                } catch (_) {
                    return on();
                }
            }
            // IE10+ & Edge
            if (!window.indexedDB && (window.PointerEvent || window.MSPointerEvent)) {
                return on();
            }
            // others
            return off();
        });
    }

    function hasLocalStorage() {
        // taken from MDN
        var storage;
        try {
            storage = window['localStorage'];
            var x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        } catch (e) {
            // return false if the error is a QuotaExceededError and the storage length is 0.
            // If the length is > 0 then we really just exceed the storage limit.
            // If another exception is thrown then probably localStorage is undefined.
            return e instanceof DOMException && (
                // everything except Firefox
                e.code === 22 ||
                // Firefox
                e.code === 1014 ||
                // test name field too, because code might not be present
                // everything except Firefox
                e.name === 'QuotaExceededError' ||
                // Firefox
                e.name === 'NS_ERROR_DOM_QUOTA_REACHED'
            ) &&
                // acknowledge QuotaExceededError only if there's something already stored
                storage.length !== 0;
        }
    }

    if (isWebView()) {
        document.body.setAttribute('web-view', '');
    } else if (isEdge()) {
        document.body.setAttribute('browser-edge', '');
    } else if (isBrowserOutdated()) {
        document.body.setAttribute('browser-outdated', '');
    } else if (!hasLocalStorage()) {
        document.body.setAttribute('no-local-storage', '');
    } else {
        // detect private browsing
        isPrivateMode().then(function (msg) {
            // Chrome is supported. All other browsers not.
            if (msg && !isChrome()) {
                document.body.setAttribute('private-mode', '');
            }
        });
    }
})();
