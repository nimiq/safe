import XElement from '/libraries/x-element/x-element.js';
import XRouter from '/elements/x-router/x-router.js';
import XSafeStart from './x-safe-start.js';
import keyguardPromise from '../keyguard.js';

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
            <x-accounts>
                <button>Create new account</button>
            </x-accounts>
            `
    }

    children() {
        return [ XRouter, XSafeStart ];
    }

    listeners() {
        return {
            'click button': () => this._startCreate()
        }
    }

    async _startCreate() {
        const keyguard = await keyguardPromise;
        const newKey = await keyguard.create();
        console.log(`Got new key ${JSON.stringify(newKey)}`);
    }
}

