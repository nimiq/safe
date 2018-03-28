const devConfig = {
    keyguardSrc: `${location.origin}/libraries/keyguard/keyguard.html`,
    networkSrc: `${location.origin}/libraries/network/network.html`,
    root: `${location.origin}/apps/safe`
}

const liveConfig = {
    keyguardSrc: 'https://secure.nimiq.com/keyguard.html',
    networkSrc: 'https://network.nimiq.com/network.html',
    root: `https://safe.nimiq.com`
}

export default devConfig;