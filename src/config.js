function getConfig(host) {
    switch (host) {
        case 'https://safe.nimiq.com':
            return {
                keyguardSrc: 'https://secure.nimiq.com/keyguard.html',
                networkSrc: 'https://network.nimiq.com/network.html',
                root: 'https://safe.nimiq.com',
                mode: 'live'
            };

        case 'https://safe.nimiq-testnet.com':
            return {
                keyguardSrc: 'https://secure.nimiq-testnet.com/keyguard.html',
                networkSrc: 'https://network.nimiq-testnet.com/network.html',
                root: 'https://safe.nimiq-testnet.com',
                mode: 'test'
            };

        default:
            if (location.pathname.includes('/dist')) {
                return {
                    keyguardSrc: `${location.origin}/libraries/keyguard/dist/keyguard.html`,
                    networkSrc: `${location.origin}/libraries/network/dist/network.html`,
                    root: `${location.origin}/apps/safe/dist`,
                    mode: 'test'
                }
            }

            return {
                keyguardSrc: `${location.origin}/libraries/keyguard/src/keyguard.html`,
                networkSrc: `${location.origin}/libraries/network/src/network.html`,
                root: `${location.origin}/apps/safe/src`,
                mode: 'test'
            }
    }
}

const host = window.location.origin;

export default getConfig(host);
