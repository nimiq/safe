import { bindActionCreators } from 'redux';
import HubApi from '@nimiq/hub-api';
import MixinRedux from './elements/mixin-redux';
import {
    addAccount,
    login,
    logout,
    populate,
    setFileFlag,
    setWordsFlag,
    switchWallet,
    rename,
    removeAccount,
} from './redux/wallet-redux.js';
import AccountType from './lib/account-type.js';

const APP_NAME = 'Accounts';

class HubClient {
    static getInstance() {
        this._instance = this._instance || new HubClient();
        window.accountManager = this._instance;
        return this._instance;
    }

    constructor() {
        this._launched = new Promise(res => this._resolveLaunched = res);
    }

    async launch() {
        this.hubApi = new HubApi();

        this.accounts = {
            get: (address) => MixinRedux.store.getState().wallets.accounts.get(address),
        };

        this._bindStore();

        // listen to response from onboarding
        this.hubApi.on(HubApi.RequestType.ONBOARD, (result, state) => {
            if (Array.isArray(result)) result.forEach(account => this._onOnboardingResult(account));
            else this._onOnboardingResult(result);
        }, (error, state) => {
            console.error('HubApi error', error);
            console.log('State', state);
        });
        this.hubApi.checkRedirectResponse();

        // Kick off writing accounts to the store
        this._populateAccounts();

        this._resolveLaunched();
    }

    async onboard() {
        await this._launched;
        this.hubApi.onboard({ appName: APP_NAME, }, new HubApi.RedirectRequestBehavior());
    }

    async create() {
        await this._launched;
        const result = await this.hubApi.signup({ appName: APP_NAME });
        this._onOnboardingResult(result);
    }

    async sign(tx) {
        await this._launched;
        tx.appName = APP_NAME;
        const signedTransaction = await this.hubApi.signTransaction(tx);
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
        const result = await this.hubApi.rename({
            appName: APP_NAME,
            accountId,
            address,
        });

        this.actions.rename(result.accountId, result.label, result.type, result.addresses.concat(result.contracts));
    }

    // for testing
    async removeAccount(address) {
        await this._launched;
        this.actions.removeAccount(address);
    }

    async export(accountId, options = {}) {
        await this._launched;

        const request = {
            appName: APP_NAME,
            accountId,
            fileOnly: options.fileOnly,
            wordsOnly: options.wordsOnly,
        };

        const result = await this.hubApi.export(request);

        if (result.wordsExported) {
            this.actions.setWordsFlag(accountId, true);
        }

        if (result.fileExported) {
            this.actions.setFileFlag(accountId, true);
        }
    }

    async exportFile(accountId) {
        await this.export(accountId, { fileOnly: true });
    }

    async exportWords(accountId) {
        await this.export(accountId, { wordsOnly: true });
    }

    async changePassword(accountId) {
        await this._launched;
        await this.hubApi.changePassword({
            appName: APP_NAME,
            accountId,
        });
    }

    async login() {
        await this._launched;
        const result = await this.hubApi.login({
            appName: APP_NAME,
        });
        result.forEach(account => this._onOnboardingResult(account));
    }

    async logout(accountId) {
        await this._launched;
        const result = await this.hubApi.logout({
            appName: APP_NAME,
            accountId,
        });
        if (result.success === true) {
            this.actions.logout(accountId);
        }
    }

    async addAccount(accountId) {
        await this._launched;
        const newAddress = await this.hubApi.addAddress({
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
            login,
            logout,
            populate,
            setFileFlag,
            setWordsFlag,
            switchWallet,
            rename,
            removeAccount,
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
            listedWallets = await this.hubApi.list();
        } catch (error) {
            if (error.message === 'MIGRATION_REQUIRED') {
                this.hubApi.migrate(new HubApi.RedirectRequestBehavior());
                return;
            }

            // TODO: Handle this case with a user notification?
            else if (error.message === 'ACCOUNTS_LOST') listedWallets = [];

            else throw error;
        }

        this.actions.populate(listedWallets);
    }

    _onOnboardingResult(result) {
        result.addresses.forEach(newAddress => {
            newAddress.type = AccountType.KEYGUARD_HIGH;
            newAddress.walletId = result.accountId;
            this.actions.addAccount(newAddress);
        });
        this.actions.login({
            id: result.accountId,
            label: result.label,
            type: result.type,
            fileExported: result.fileExported,
            wordsExported: result.wordsExported,
        });
    }

    // https://stackoverflow.com/a/41797377/4204380
    _hexToBase64(hexstring) {
        return btoa(hexstring.match(/\w{2}/g)
            .map(a => String.fromCharCode(parseInt(a, 16)))
            .join(''));
    }
}

export default HubClient.getInstance();
