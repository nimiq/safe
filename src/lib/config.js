export default class Config {

    /* Public methods */

    static get tld() {
        const tld = window.location.origin.split('.');
        tld.shift(); // Remove subdomain
        return tld.join('.');
    }

    // sure we want to allow this?
    static set network(network) {
        Config._network = network;
    }

    static get network() {
        if (Config._network) return Config._network;

        if (Config.offlinePackaged) return 'main';

        switch (Config.tld) {
            case 'nimiq.com': return 'main';
            case 'nimiq-testnet.com': return 'test';
            default: return 'test'; // Set this to 'test', 'bounty', or 'dev' for localhost development
        }
    }

    static get cdn() {
        if (Config.offlinePackaged) return Config.src('keyguard') + '/nimiq.js';

        switch (Config.tld) {
            case 'nimiq.com': return 'https://cdn.nimiq.com/v1.4.1/nimiq.js';
            default: return 'https://cdn.nimiq-testnet.com/v1.4.1/nimiq.js'; // TODO make https://cdn.nimiq.com/v1.4.1/nimiq.js the default
        }
    }

    static set devMode(devMode) {
        Config._devMode = devMode;
    }

    static get devMode() {
        if (Config._devMode) return Config._devMode;

        switch (Config.tld) {
            case 'nimiq.com': return false;
            case 'nimiq-testnet.com': return false;
            default: return true;
        }
    }

    static get productionMode() {
        if (Config.tld === 'nimiq.com') return true;
        return false;
    }

    static origin(subdomain) {
        return Config._origin(subdomain);
    }

    static src(subdomain) {
        return Config._origin(subdomain, true);
    }

    static get online() {
        return !Config.offline;
    }

    /* Private methods */

    static _origin(subdomain, withPath) {
        if (location.origin.includes('localhost')) {
            return Config._localhost(subdomain, withPath);
        }

        if (Config.devMode) {
            return Config._localhost(subdomain, withPath, true);
        }

        return `https://${subdomain}.${Config.tld}${(withPath && '/') || ''}`;
    }

    static _localhost(subdomain, withPath, ipMode) {
        let path;

        if (withPath) {
            if (Config.offlinePackaged) path = `/${subdomain}/`;
            else path = `/${location.pathname.includes('/dist') ? `deployment-${subdomain}/dist/` : 'src/'}`;
        }

        subdomain = Config.offlinePackaged ? '' : subdomain + '.';

        const origin = ipMode ? location.hostname : `${subdomain}localhost`;

        return `${location.protocol}//${origin}${location.port ? `:${location.port}` : ''}${path}`;
    }
}

// Signal if the app should be started in offline mode
Config.offline = navigator.onLine !== undefined && !navigator.onLine;

// When packaged as distributed offline app, subdomains are folder names instead
Config.offlinePackaged = false;
