function getConfig(host) {
    switch (host) {
        case 'https://safe.nimiq.com':
            return {
                keyguardSrc: 'https://secure.nimiq.com',
                networkSrc: 'https://network.nimiq.com',
                root: 'https://safe.nimiq.com',
                mode: 'live'
            };

        case 'https://safe.nimiq-testnet.com':
            return {
                keyguardSrc: 'https://secure.nimiq-testnet.com',
                networkSrc: 'https://network.nimiq-testnet.com',
                root: 'https://safe.nimiq-testnet.com',
                mode: 'test'
            };

        default:
            if (location.pathname.includes('/dist')) {
                return {
                    keyguardSrc: `${location.origin}/libraries/keyguard/dist/`,
                    networkSrc: `${location.origin}/libraries/network/dist/`,
                    root: `${location.origin}/apps/safe/dist`,
                    mode: 'test'
                }
            }

            return {
                keyguardSrc: `${location.origin}/libraries/keyguard/src/`,
                networkSrc: `${location.origin}/libraries/network/src/`,
                root: `${location.origin}/apps/safe/src`,
                mode: 'test'
            }
    }
}

const host = window.location.origin;

export default getConfig(host);