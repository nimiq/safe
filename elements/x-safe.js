import XElement from '/libraries/x-element/x-element.js';
import XRouter from '/elements/x-router/x-router.js';
import XIdenticons from './x-create-account/x-identicons/x-identicons.js';
import XSafeStart from './x-safe-start.js';

export default class XSafe extends XElement {

    html() {
        return `
            <x-router>
                <main x-route="success">Success!</main>
                <main x-route="error">Error</main>
                <x-identicons x-route="new-account"></x-identicons>
                <x-import-file x-route="import-from-file"> Import via backup file</x-import-file>
                <main x-route="sign"> New Transaction</main>
                <main x-route="vesting"> Vesting contracts</main>
                <x-safe-start x-route="/"></x-safe-start>
            </x-router>
            <x-accounts></x-accounts>
            `
    }

    children() {
        return [ XRouter, XIdenticons, XSafeStart ];
    }
}

