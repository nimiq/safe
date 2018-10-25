import { bindActionCreators } from '/libraries/redux/src/index.js';
import { addAccount, setAllKeys as setAllAccounts, updateLabel as updateAccountLabel } from '/elements/x-accounts/accounts-redux.js';
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js';
import AccountsManagerClient from './AccountsManagerClient.es.js';
import { WalletType, setAllKeys as setAllWallets, login, logout, updateLabel as updateWalletLabel, updateNumberAccounts } from './wallet-redux.js';

class AccountManager {
    static getInstance() {
        this._instance = this._instance || new AccountManager();
        window.accountManager = this._instance;
        return this._instance;
    }

    constructor() {
        this._launched = new Promise(res => this._resolveLaunched = res);
    }

    async launch() {
        this.accountsManagerClient = new AccountsManagerClient();

        this.accounts = {
            get: (address) => MixinRedux.store.getState().accounts.entries.get(address),
        };

        this._bindStore();

        // Kick off writing accounts to the store
        this._populateAccounts();

        this._resolveLaunched();
    }

    _bindStore() {
        this.store = MixinRedux.store;

        this.actions = bindActionCreators({
            addAccount,
            setAllAccounts,
            updateAccountLabel,
            setAllWallets,
            login,
            logout,
            updateWalletLabel,
            updateNumberAccounts,
        }, this.store.dispatch);
    }

    async _populateAccounts() {
        await this._launched;

        /**
         * type key = {
         *     id: string
         *     label: string,
         *     addresses: Map<string, AddressInfoEntry>,
         *     contracts: [],
         *     type: WalletType,
         * }
         */

        const keys = await this.accountsManagerClient.list();

        const wallets = [];
        const accounts = [];

        keys.forEach(key => {
            wallets.push({
                id: key.id,
                label: key.label,
                type: key.type,
                numberAccounts: key.addresses.size,
            });

            Array.from(key.addresses.keys()).forEach(address => {
                const entry = {
                    address,
                    label: key.addresses.get(address).label,
                    type: AccountType.KEYGUARD_HIGH,
                    isLegacy: key.type === WalletType.LEGACY,
                    keyId: key.id,
                };
                accounts.push(entry);
            });
        });

        this.actions.setAllAccounts(accounts);
        this.actions.setAllWallets(wallets);
    }

    /// PUBLIC API ///

    // async getDefaultAccount() {
    //     const defaultAccount = await this.keyguard.getDefaultAccount();
    //     defaultAccount.type = defaultAccount.type === 'high' ? AccountType.KEYGUARD_HIGH : AccountType.KEYGUARD_LOW;
    //     return defaultAccount;
    // }

    async create() {
        await this._launched;
        const result = await this._invoke('signup', {type: AccountType.KEYGUARD_HIGH}, {
            appName: 'Nimiq Safe',
        });
        const newAccount = result.address;
        newAccount.type = AccountType.KEYGUARD_HIGH;
        this.actions.addAccount(newAccount);
        this.actions.login({
            id: result.keyId,
            label: result.label,
            type: result.type,
            numberAccounts: 1,
        });
    }

    async sign(tx) {
        await this._launched;
        const account = this.accounts.get(tx.sender);
        tx.keyId = account.keyId;
        return this._invoke('signTransaction', account, tx);
    }

    // async rename(address) {
    //     await this._launched;
    //     const account = this.accounts.get(address);
    //     const label = await this._invoke('rename', account, address);
    //     this.actions.updateAccountLabel(account.address, label);
    // }

    // async backupFile(address) {
    //     await this._launched;
    //     const account = this.accounts.get(address);
    //     return this._invoke('backupFile', account, address);
    // }

    // async backupWords(address) {
    //     await this._launched;
    //     const account = this.accounts.get(address);
    //     this._invoke('backupWords', account, address);
    // }

    async login() {
        await this._launched;
        const result = await this._invoke('login', {type: AccountType.KEYGUARD_HIGH}, {
            appName: 'Nimiq Safe',
        });
        result.addresses.forEach(newAccount => {
            newAccount.type = AccountType.KEYGUARD_HIGH;
            newAccount.keyId = result.keyId;
            newAccount.isLegacy = result.type === WalletType.LEGACY;
            this.actions.addAccount(newAccount);
        });
        this.actions.login({
            id: result.keyId,
            label: result.label,
            type: result.type,
            numberAccounts: result.addresses.length,
        });
    }

    async logout(keyId) {
        await this._launched;
        const result = await this._invoke('logout', {type: AccountType.KEYGUARD_HIGH}, {
            appName: 'Nimiq Safe',
            keyId: keyId,
        });
        if (result.success === true) this.actions.logout(keyId);
        else throw new Error('Logout failed');
    }

    // async importLedger() {
    //     await this._launched;
    //     const newKey = {
    //         address: await this.ledger.getAddress(true),
    //         type: AccountType.LEDGER,
    //         label: 'Ledger Account'
    //     };
    //     return this._import(newKey);
    // }

    // async confirmLedgerAddress(address) {
    //     return this.ledger.confirmAddress(address);
    // }

    // signMessage(msg, address) {
    //     throw new Error('Not implemented!'); return;

    //     const account = this.accounts.get(address);
    //     this._invoke('signMessage', account);
    // }

    // async _import(key) {
    //     this.actions.addAccount(key);

    //     // Find and add vesting accounts
    //     (await this.vesting.find([key.address]))
    //         .forEach((vestingKey) => {
    //             const k = Object.assign({}, vestingKey, {
    //                 type: AccountType.VESTING,
    //                 label: `Vesting Contract`
    //             });
    //             this.actions.addAccount(k);
    //         });
    // }

    _invoke(method, account, ...args) {
        return this.accountsManagerClient[method](...args);
    }
}

export default AccountManager.getInstance();

// export default methodDict = {
//     'sign': {
//         1: 'sign',
//         2: null,
//         3: null
//     },
//     'rename': {
//         1: 'rename',
//         2: null,
//         3: null
//     },
//     'export': {
//         1: 'export',
//         2: null,
//         3: null
//     },
//     'signMessage': {
//         1: 'signMessage',
//         2: null,
//         3: null
//     }
// }

const AccountType = {
    KEYGUARD_HIGH: 1,
    KEYGUARD_LOW: 2,
    LEDGER: 3,
    VESTING: 4
};
