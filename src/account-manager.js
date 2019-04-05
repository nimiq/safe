import { bindActionCreators } from '/libraries/redux/src/index.js';
import {
    addAccount,
    setAllAccounts,
    updateLabel as updateAccountLabel,
    logoutLegacy
} from '/elements/x-accounts/accounts-redux.js';
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js';
import AccountsClient from './AccountsClient.standalone.es.js';
import {
    WalletType,
    setAllWallets,
    login,
    logout,
    updateLabel as updateWalletLabel,
    setDefaultWallet,
    switchWallet,
    setFileFlag,
    setWordsFlag,
    LEGACY
} from './wallet-redux.js';
import AccountType from './lib/account-type.js';

class AccountManager {
    static getInstance() {
        this._instance = this._instance || new AccountManager();
        window.accountManager = this._instance;
        return this._instance;
    }

    constructor() {
        this._launched = new Promise(res => this._resolveLaunched = res);
        this.accountsLoaded = new Promise(res => this._resolveAccountsLoaded = res);
    }

    async launch() {
        this.accountsClient = new AccountsClient();

        this.accounts = {
            get: (address) => MixinRedux.store.getState().accounts.entries.get(address),
        };

        this._bindStore();

        // listen to response from onboarding
        this.accountsClient.on(AccountsClient.RequestType.ONBOARD, (result, state) => {
            this._onOnboardingResult(result);
        }, (error, state) => {
            console.error('AccountsManager error', error);
            console.log('State', state);
        });
        this.accountsClient.checkRedirectResponse();

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
            setDefaultWallet,
            login,
            logout,
            logoutLegacy,
            updateWalletLabel,
            switchWallet,
            setFileFlag,
            setWordsFlag
        }, this.store.dispatch);
    }

    async _populateAccounts() {
        await this._launched;

        /**
         * type key = {
         *     id: string
         *     label: string,
         *     accounts: Map<string, AccountInfoEntry>,
         *     contracts: [],
         *     type: WalletType,
         *     keyMissing: boolean,
         *     fileExported: boolean,
         *     wordsExported: boolean,
         * }
         *
         * interface AccountInfoEntry {
         *     path: string;
         *     label: string;
         *     address: Uint8Array;
         *     balance?: number;
         * }
         */

        let listedWallets;
        try {
            listedWallets = await this.accountsClient.list();
        } catch (error) {
            if (error.message === 'MIGRATION_REQUIRED') {
                this.accountsClient.migrate(new AccountsClient.RedirectRequestBehavior());
                return;
            }

            // TODO: Handle this case with a user notification?
            else if (error.message === 'WALLETS_LOST') listedWallets = [];

            else throw error;
        }

        const wallets = [];
        const accounts = [];

        listedWallets.forEach(wallet => {

            if (wallet.type !== WalletType.LEGACY) {
                wallets.push({
                    id: wallet.id,
                    label: wallet.label,
                    type: wallet.type,
                    fileExported: wallet.fileExported,
                    wordsExported: wallet.wordsExported,
                });
            }

            Array.from(wallet.accounts.keys()).forEach(address => {
                const entry = {
                    address,
                    label: wallet.accounts.get(address).label,
                    type: AccountType.KEYGUARD_HIGH,
                    isLegacy: wallet.type === WalletType.LEGACY,
                    walletId: wallet.id,
                };
                accounts.push(entry);
            });
        });

        this.actions.setAllAccounts(accounts);
        this.actions.setAllWallets(wallets);

        this._resolveAccountsLoaded();
    }

    /// PUBLIC API ///

    async onboard() {
        await this._launched;
        this._invoke(
            'onboard',
            null,
            {
                appName: 'Nimiq Safe',
            },
            new AccountsClient.RedirectRequestBehavior()
        );
    }

    async create() {
        await this._launched;
        const result = await this._invoke('signup', null, {
            appName: 'Nimiq Safe',
        });
        this._onOnboardingResult(result);
    }

    async sign(tx) {
        await this._launched;
        const account = this.accounts.get(tx.sender);
        tx.accountId = account.walletId;

        const signedTransaction = await this._invoke('signTransaction', null, tx);

        const rawTx = signedTransaction.raw;
        rawTx.hash = this._hexToBase64(signedTransaction.hash);
        return rawTx;
    }

    /**
     * @param {string} accountId
     * @param {string} [address]
     */
    async rename(accountId, address) {
        await this._launched;
        const result = await this._invoke('rename', null, {
            appName: 'Nimiq Safe',
            accountId,
            address,
        });

        this.actions.updateWalletLabel(result.accountId, result.label);
        result.addresses.forEach(address => this.actions.updateAccountLabel(address.address, address.label));

        // TODO: Remove unreturned addresses and add new returned addresses
    }

    async exportFile(accountId) {
        await this._launched;
        const result = await this._invoke('export', null, {
            appName: 'Nimiq Safe',
            accountId,
            fileOnly: true,
        });

        if (result.fileExported) {
            this.actions.setFileFlag(accountId, true);
        }
    }

    async exportWords(accountId) {
        await this._launched;
        const result = await this._invoke('export', null, {
            appName: 'Nimiq Safe',
            accountId,
            wordsOnly: true,
        });

        if (result.wordsExported) {
            this.actions.setWordsFlag(accountId, true);
        }
    }

    async changePassword(accountId) {
        await this._launched;
        await this._invoke('changePassword', null, {
            appName: 'Nimiq Safe',
            accountId,
        });
    }

    async login() {
        await this._launched;
        const result = await this._invoke('login', null, {
            appName: 'Nimiq Safe',
        });
        this._onOnboardingResult(result);
    }

    async logout(accountId) {
        await this._launched;
        const result = await this._invoke('logout', null, {
            appName: 'Nimiq Safe',
            accountId,
        });
        if (result.success === true) this.actions.logout(accountId);
    }

    async logoutLegacy(accountId) {
        await this._launched;
        const result = await this._invoke('logout', null, {
            appName: 'Nimiq Safe',
            accountId,
        });
        if (result.success === true) this.actions.logoutLegacy(accountId);
    }

    async addAccount(accountId) {
        await this._launched;
        const newAddress = await this._invoke('addAddress', null, {
            appName: 'Nimiq Safe',
            accountId,
        });
        newAddress.type = AccountType.KEYGUARD_HIGH;
        newAddress.walletId = accountId;
        newAddress.isLegacy = false;
        this.actions.addAccount(newAddress);
    }

    // signMessage(msg, address) {
    //     throw new Error('Not implemented!'); return;

    //     const account = this.accounts.get(address);
    //     this._invoke('signMessage', account);
    // }

    _onOnboardingResult(result) {
        result.addresses.forEach(newAddress => {
            newAddress.type = AccountType.KEYGUARD_HIGH;
            newAddress.walletId = result.accountId;
            newAddress.isLegacy = result.type === WalletType.LEGACY;
            this.actions.addAccount(newAddress);
        });
        if (result.type === WalletType.LEGACY) {
            this.actions.switchWallet(LEGACY);
        } else {
            this.actions.login({
                id: result.accountId,
                label: result.label,
                type: result.type,
                fileExported: result.fileExported,
                wordsExported: result.wordsExported,
            });
        }
    }

    _invoke(method, account, ...args) {
        return this.accountsClient[method](...args);
    }

    // https://stackoverflow.com/a/41797377/4204380
    _hexToBase64(hexstring) {
        return btoa(hexstring.match(/\w{2}/g)
            .map(a => String.fromCharCode(parseInt(a, 16)))
            .join(''));
    }
}

export default AccountManager.getInstance();
