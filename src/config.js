function getConfig(host) {
    switch (host) {
        case 'https://safe.nimiq.com':
            return {
                keyguardSrc: 'https://secure.nimiq.com/index-list-only.html',
                networkSrc: 'https://network.nimiq.com',
                root: 'https://safe.nimiq.com',
                mode: 'main'
            };

        case 'https://safe.nimiq-testnet.com':
            return {
                keyguardSrc: 'https://secure.nimiq-testnet.com/index-list-only.html',
                networkSrc: 'https://network.nimiq-testnet.com',
                root: 'https://safe.nimiq-testnet.com',
                mode: 'test'
            };

        default:
            if (location.pathname.includes('/dist')) {
                return {
                    keyguardSrc: `${location.origin}/libraries/keyguard/dist/index-list-only.html`,
                    networkSrc: `${location.origin}/libraries/network/dist/`,
                    root: `${location.origin}/apps/safe/dist`,
                    mode: 'dev'
                }
            }

            return {
                keyguardSrc: `${location.origin}/libraries/keyguard/src/index-list-only.html`,
                networkSrc: `${location.origin}/libraries/network/src/`,
                root: `${location.origin}/apps/safe/src`,
                mode: 'dev'
            }
    }
}

const host = window.location.origin;

export default getConfig(host);
