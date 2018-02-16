(function() {
    function isSupportedBrowser() {
        if (typeof Symbol === "undefined") return false;
        if (typeof navigator.mediaDevices === 'undefined'
            || typeof navigator.mediaDevices.getUserMedia === 'undefined') return false;
        try {
            eval("class Foo {}");
            eval("var bar = async (x) => x+1");
        } catch (e) {
            return false;
        }
        return true;
    }

    if (!isSupportedBrowser()) {
        document.body.setAttribute('browser-unsupported', '');
    }
})();