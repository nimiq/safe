import Router from '/libraries/es6-router/src/index.js';

import XImportAccount from '/elements/x-import-account/x-import-account.js';

export default new Router()
    .add('authorize', () => {
        // show policy and wait for confirmation
        // UI.showAuthorize()
    })
    .add('import/{params}', (params) => {
        return new XImportAccount(params);
    })
    .add('export/', () => {
        return new XExportAccount(params);
    })

    .add('export/{sub}', (sub) => {
        switch (sub) {
            case 'password':
                break;
            case 'download':
                break;
        }
    })
    .add('export/password', () => {
        Export.handleExport(step)
    })
    .add('export/download', () => {
        Export.handleExport(step)
    })
    .add('export/upload', () => {
        Export.handleExport(step)
    })
    .add('export/password-test', () => {
        Export.handleExport(step)
    })
    .add('export/are-you-secure', () => {
        Export.handleExport(step)
    })
    .add('export/mnemonic-phrase', () => {
        Export.handleExport(step)
    })
    .add('export/test-mnemonic-phrase/{step}', (step) => {
        if (step < 0 || step > 2) throw '404';
        Export.handleExport(step)
    })
    .add('export/password', () => {
        Export.handleExport(step)
    })
    .add('export/password', () => {
        Export.handleExport(step)
    })
    .add('test\/{param1}\/{param2}', (param1, param2) => {
        alert(`received confirmation with params ${param1} and ${param2}`);
    })
    .add(() => {
        alert('home page');
    });