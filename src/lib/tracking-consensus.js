class TrackingConsensus {
    static init() {
        const settings = this._readStorage();
        if (typeof settings.allowsBrowserData === 'undefined') {
            // Not yet set, ask user
            document.getElementById('tracking-consensus').classList.remove('display-none');
        } else {
            if (this.allowsTracking(settings)) this._appendScript();
        }
    }

    static allowsBrowserData() {
        return this._readStorage().allowsBrowserData;
    }

    static allowsUsageData() {
        return this._readStorage().allowsUsageData;
    }

    static allowsTracking(settings) {
        console.debug("Tracking settings:", settings);
        return settings.allowsBrowserData || settings.allowsUsageData;
    }

    /**
     * @params {{allowsBrowserData?: boolean, allowsUsageData?: boolean}} obj
     */
    static update(obj) {
        document.getElementById('tracking-consensus').classList.add('display-none');

        const settings = Object.assign(this._readStorage(), obj);
        localStorage.setItem(TrackingConsensus.STORAGE_KEY, JSON.stringify(settings));

        // If at least one of the settings is true, start the tracking script
        if (this.allowsTracking(settings)) this._appendScript();
    }

    static initPaq() {
        window._paq = [];
        _paq.push(['trackPageView']);
        _paq.push(['enableLinkTracking']);
    }

    static _readStorage() {
        const storage = localStorage.getItem(TrackingConsensus.STORAGE_KEY);
        if (!storage) return {}
        return JSON.parse(storage);
    }

    static _appendScript() {
        if (this._appendedScript) return;
        console.debug('Appending Tracking Script');

        /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
        (function () {
            var u = "//stats.nimiq-network.com/";
            _paq.push(['setTrackerUrl', u + 'nimiq.php']);
            _paq.push(['setSiteId', '3']);
            var d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
            g.type = 'text/javascript'; g.async = true; g.defer = true; g.src = u + 'nimiq.js'; s.parentNode.insertBefore(g, s);
        })();

        this._appendedScript = true;
    }
}

TrackingConsensus._appendedScript = false;
TrackingConsensus.STORAGE_KEY = 'tracking-consensus';

export default TrackingConsensus;
