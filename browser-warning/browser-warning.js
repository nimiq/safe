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
        return isOutdatedIos();
    }

    function isEdge() {
        return navigator.userAgent.indexOf('Edge') !== -1;
    }

    function isOutdatedIos() {
        if (!/iP(hone|od|ad)/.test(navigator.platform)) return false;
        var version = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
        version = [parseInt(version[1], 10), parseInt(version[2], 10), parseInt(version[3] || 0, 10)];
        return version[0] < 11 || (version[0] === 11 && (version[1] <= 2));
    }

    if (isEdge()) {
        document.body.setAttribute('browser-edge', '');
    } else if (isBrowserOutdated()) {
        document.body.setAttribute('browser-outdated', '');
    }
})();