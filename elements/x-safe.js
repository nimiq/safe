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
                <button id="create">Create new account</button>
                <button id="import-file">Import account from file</button>
                <button id="import-words">Import account from words</button>
                <button id="export">Export</button>
            </x-accounts>
            `
    }

    children() {
        return [ XRouter, XSafeStart ];
    }

    listeners() {
        return {
            'click button#create': () => this._startCreate(),
            'click button#import-file': () => this._startImportFile(),
            'click button#import-words': () => this._startImportWords(),
            'click button#export': () => this._startExport(),
        }
    }

    async _startCreate() {
        const keyguard = await keyguardPromise;
        const newKey = await keyguard.create();
        console.log('Got new key:', newKey);
    }

    async _startImportFile() {
        const keyguard = await keyguardPromise;
        const newKey = await keyguard.importFromFile('12e1e112e12e12e12e12e21e');
        console.log(`Got new key ${JSON.stringify(newKey)}`);
    }

    async _startImportWords() {
        const keyguard = await keyguardPromise;
        const newKey = await keyguard.importFromWords();
        console.log(`Got new key ${JSON.stringify(newKey)}`);
    }

    async _startExport() {
        const keyguard = await keyguardPromise;
        const encKey = await keyguard.exportKey('');
        console.log(`Encrypted private key ${JSON.stringify(encKey)}`);
    }
}

