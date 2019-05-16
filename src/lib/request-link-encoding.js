// Encode / decode a request link.
// Note that the encoding scheme is the same as for XRouter aside route parameters (see _makeAside).

import ValidationUtils from './validation-utils.js';

export function createRequestLink(
    recipient,
    amount = null, // in NIM
    message = null,
    basePath = window.location.host
) {
    if (!ValidationUtils.isValidAddress(recipient)) throw new Error(`Not a valid address: ${recipient}`);
    if (amount !== null && typeof amount !== 'number') throw new Error(`Not a valid amount: ${amount}`);
    if (message !== null && typeof message !== 'string') throw new Error(`Not a valid message: ${message}`);
    const params = [
        recipient.replace(/ /g, ''), // strip spaces
        amount || '',
        encodeURIComponent(message || '')
    ];
    // don't encode empty params (if they are not followed by other non-empty params)
    while (params[params.length - 1] === '') params.pop();

    if (!basePath.endsWith('/')) basePath = `${basePath}/`;

    return `${basePath}#_request/${params.join('/')}_`;
}

export function parseRequestLink(requestLink, requiredBasePath = null) {
    if (!(requestLink instanceof URL)) {
        try {
            requestLink = new URL(requestLink);
        } catch(e) {
            return null;
        }
    }
    if (requiredBasePath && requestLink.host !== requiredBasePath) return null;
    // check whether it's a request link
    const requestRegex = /_request\/(([^/]+)(\/[^/]*){0,2})_/;
    const requestRegexMatch = requestLink.hash.match(requestRegex);
    if (!requestRegexMatch) return null;
    // parse params
    const paramsSubstr = requestRegexMatch[1];
    let [recipient, amount, message] = paramsSubstr.split('/');
    // check params
    recipient = recipient
        .replace(/[ +-]|%20/g, '') // strip spaces and dashes
        .replace(/(.)(?=(.{4})+$)/g, '$1 '); // reformat with spaces at the desired locations, forming blocks of 4 chars
    if (!ValidationUtils.isValidAddress(recipient)) return null; // recipient is required
    if (typeof amount !== 'undefined' && amount !== '') {
        amount = parseFloat(amount);
        if (Number.isNaN(amount)) return null;
    } else {
        amount = null;
    }
    if (typeof message !== 'undefined' && message !== '') {
        message = decodeURIComponent(message) ;
    } else {
        message = null;
    }
    return { recipient, amount, message };
}
