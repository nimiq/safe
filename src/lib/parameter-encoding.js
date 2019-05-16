export function dashToSpace(string) {
    if (typeof string !== 'string') return null;
    return string.replace(/-/gi, ' ');
}

export function spaceToDash(string) {
    if (typeof string !== 'string') return null;
    return string.replace(/ /gi, '-');
}