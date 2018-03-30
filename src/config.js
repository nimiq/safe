const devConfig = {
    keyguardSrc: `${location.origin}/libraries/keyguard/src/keyguard.html`,
    networkSrc: `${location.origin}/libraries/network/src/network.html`,
    root: `${location.origin}/apps/safe/src`
}

const liveConfig = {
    keyguardSrc: 'https://secure.nimiq.com/keyguard.html',
    networkSrc: 'https://network.nimiq.com/network.html',
    root: `https://safe.nimiq.com`
}

export default devConfig;