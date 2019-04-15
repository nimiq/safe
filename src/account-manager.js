import { bindActionCreators } from '/libraries/redux/src/index.js';
import {
    addAccount,
    updateLabel as updateAccountLabel,
    logoutLegacy
} from '/elements/x-accounts/accounts-redux.js';
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js';
import AccountsClient from './AccountsClient.standalone.es.js';
import {
    WalletType,
    login,
    logout,
    updateLabel as updateWalletLabel,
    setDefaultWallet,
    switchWallet,
    setFileFlag,
    setWordsFlag,
    populate,
    LEGACY
} from './wallet-redux.js';
import AccountType from './lib/account-type.js';

const APP_NAME = 'Accounts';

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

    async onboard() {
        await this._launched;
        this.accountsClient.onboard({ appName: APP_NAME, }, new AccountsClient.RedirectRequestBehavior());
    }

    async create() {
        await this._launched;
        const result = await this.accountsClient.signup({ appName: APP_NAME });
        this._onOnboardingResult(result);
    }

    async sign(tx) {
        await this._launched;
        const signedTransaction = await this.accountsClient.signTransaction(tx);
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
        const result = await this.accountsClient.rename({
            appName: APP_NAME,
            accountId,
            address,
        });

        this.actions.updateWalletLabel(result.accountId, result.label);
        result.addresses.forEach(address => this.actions.updateAccountLabel(address.address, address.label));

        // TODO: Remove unreturned addresses and add new returned addresses
    }

    async export(accountId, options = {}) {
        await this._launched;

        const request = {
            appName: APP_NAME,
            accountId,
            fileOnly: options.fileOnly,
            wordsOnly: options.wordsOnly,
        };

        const result = await this.accountsClient.export(request);

        if (result.wordsExported) {
            this.actions.setWordsFlag(accountId, true);
        }

        if (result.fileExported) {
            this.actions.setFileFlag(accountId, true);
        }
    }

    exportFile(accountId) {
        this.export(accountId, { fileOnly: true });
    }

    async exportWords(accountId) {
        this.export(accountId, { wordsOnly: true });
    }

    async changePassword(accountId) {
        await this._launched;
        await this.accountsClient.changePassword({
            appName: APP_NAME,
            accountId,
        });
    }

    async login() {
        await this._launched;
        const result = await this.accountsClient.login({
            appName: APP_NAME,
        });
        this._onOnboardingResult(result);
    }

    async logout(accountId) {
        await this._launched;
        const result = await this.accountsClient.logout({
            appName: APP_NAME,
            accountId,
        });
        if (result.success === true) {
            this.actions.logout(accountId);
        }
    }

    async logoutLegacy(accountId) {
        await this._launched;
        const result = await this.accountsClient.logout({
            appName: APP_NAME,
            accountId,
        });
        if (result.success === true) {
            this.actions.logoutLegacy(accountId);
        }
    }

    async addAccount(accountId) {
        await this._launched;
        const newAddress = await this.accountsClient.addAddress({
            appName: APP_NAME,
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

    _bindStore() {
        this.store = MixinRedux.store;

        this.actions = bindActionCreators({
            addAccount,
            updateAccountLabel,
            setDefaultWallet,
            login,
            logout,
            logoutLegacy,
            updateWalletLabel,
            switchWallet,
            setFileFlag,
            setWordsFlag,
            populate
        }, this.store.dispatch);
    }

    async _populateAccounts() {
        await this._launched;

        /**
         * interface Account = {
         *     accountId: string
         *     label: string,
         *     type: WalletType,
         *     fileExported: boolean,
         *     wordsExported: boolean,
         *     addresses: Address[],
         *     contracts: Contract[],
         * }
         *
         * interface Address {
         *     label: string,
         *     address: string,
         * }
         *
         * interface Contract {
         *     label: string,
         *     address: string;
         * }
         *
         * interface VestingContract extends Contract {
         *     owner: string,
         *     start: number,
         *     stepAmount: number,
         *     stepBlocks: number,
         *     totalAmount: number,
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

        this.actions.populate(listedWallets);
    }

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

    // https://stackoverflow.com/a/41797377/4204380
    _hexToBase64(hexstring) {
        return btoa(hexstring.match(/\w{2}/g)
            .map(a => String.fromCharCode(parseInt(a, 16)))
            .join(''));
    }
}

export default AccountManager.getInstance();
