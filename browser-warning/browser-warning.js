(function() {
    function isBrowserOutdated() {
        if (typeof Symbol === "undefined") return true;
        if (typeof navigator.mediaDevices === 'undefined'
            || typeof navigator.mediaDevices.getUserMedia === 'undefined') return true;
        try {
            eval("class Foo {}");
            eval("var bar = async (x) => x+1");
        } catch (e) {
            return true;
        }
        return false;
    }

    function isEdge() {
        return navigator.userAgent.indexOf('Edge') !== -1;
    }

    if (isEdge()) {
        document.body.setAttribute('browser-edge', '');
    } else if (isBrowserOutdated()) {
        document.body.setAttribute('browser-outdated', '');
    }
})();