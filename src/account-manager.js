import { bindActionCreators } from '/libraries/redux/src/index.js';
import { addAccount, setAllKeys as setAllAccounts, updateLabel as updateAccountLabel } from '/elements/x-accounts/accounts-redux.js';
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js';
import AccountsClient from './AccountsClient.standalone.es.js';
import { WalletType, setAllKeys as setAllWallets, login, logout, updateLabel as updateWalletLabel, setDefaultWallet, LEGACY, setFileFlag, setWordsFlag  } from './wallet-redux.js';

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
            updateWalletLabel,
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

        listedWallets.forEach(key => {
            wallets.push({
                id: key.id,
                label: key.label,
                type: key.type,
                fileExported: key.fileExported,
                wordsExported: key.wordsExported,
            });

            Array.from(key.accounts.keys()).forEach(address => {
                const entry = {
                    address,
                    label: key.accounts.get(address).label,
                    type: AccountType.KEYGUARD_HIGH,
                    isLegacy: key.type === WalletType.LEGACY,
                    walletId: key.id,
                };
                accounts.push(entry);
            });
        });

        this.actions.setAllAccounts(accounts);
        this.actions.setAllWallets(wallets);

        // if empty legacy wallet is set as default, set the wallet with the most accounts as default instead
        // TODO ideally, this should be solved in reducer code alone to avoid this kind of invalid state
        const state = MixinRedux.store.getState();
        const legacyIsDefault = state.wallets.activeWalletId === LEGACY;
        if (legacyIsDefault) {
            const legacyIsEmpty = Array.from(state.accounts.entries.values())
                .filter(a => a.isLegacy)
                .length === 0;

            if (legacyIsEmpty) {
                const walletWithMostAccounts = listedWallets.sort(
                    (a, b) => a.accounts.size > b.accounts.size
                        ? -1
                        : a.accounts.size < b.accounts.size
                            ? 1
                            : 0
                )[0];

                if (walletWithMostAccounts) {
                    this.actions.setDefaultWallet(walletWithMostAccounts.id);
                }
            }
        }

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
        const result = await this._invoke('exportFile', null, {
            appName: 'Nimiq Safe',
            accountId,
        });

        if (result.success) {
            // Update fileExported flag
            this.actions.setFileFlag(accountId, true);
        }
    }

    async exportWords(accountId) {
        await this._launched;
        const result = await this._invoke('exportWords', null, {
            appName: 'Nimiq Safe',
            accountId,
        });

        if (result.success) {
            // Update wordsExported flags
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
        else throw new Error('Logout failed');
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

    _onOnboardingResult(result) {
        result.addresses.forEach(newAddress => {
            newAddress.type = AccountType.KEYGUARD_HIGH;
            newAddress.walletId = result.accountId;
            newAddress.isLegacy = result.type === WalletType.LEGACY;
            this.actions.addAccount(newAddress);
        });
        if (result.type === WalletType.LEGACY) {
            this.actions.login({ id: LEGACY });
        } else {
            this.actions.login({
                id: result.accountId,
                label: result.label,
                type: result.type,
                fileExported: result.fileExported,
                hasWords: undefined,
            });
        }
    }

    _invoke(method, account, ...args) {
        return this.accountsClient[method](...args);
    }

    // https://stackoverflow.com/a/41797377/4204380
    _hexToBase64(hexstring) {
        return btoa(hexstring.match(/\w{2}/g).map(function(a) {
            return String.fromCharCode(parseInt(a, 16));
        }).join(""));
    }
}

export default AccountManager.getInstance();

const AccountType = {
    KEYGUARD_HIGH: 1,
    KEYGUARD_LOW: 2,
    LEDGER: 3,
    VESTING: 4
};
