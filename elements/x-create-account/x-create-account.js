import XElement from '/libraries/x-element/x-element.js';
import XRouter from '/elements/x-router/x-router.js';
import XIdenticons from './x-identicons/x-identicons.js';

export default class XCreateAccount extends XElement {

    html() {
        return `
            <x-identicons x-route="identicons"></x-identicons>
            <main route="/"><a x-href="identicons">start creation</a></main>
            `
    }

    children() {
        return [ XIdenticons ];
    }
}

