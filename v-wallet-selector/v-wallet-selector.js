import XElement from '/libraries/x-element/x-element.js'
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js'
import { switchWallet } from '/apps/safe/src/wallet-redux.js'
import ReduxProvider from '../node_modules/vuejs-redux/bundle.es.js'
import { walletsArray$, activeWalletId$, activeWallet$ } from '/apps/safe/src/selectors/wallet$.js'
import accountManager from '/apps/safe/src/account-manager.js'

export default class VWalletSelector extends MixinRedux(XElement) {
    html() {
        return `
            <div active-wallet-label></div>
            <div class="v-wallet-menu display-none" id="vue-wallet-menu-${this.attributes.instance}">
                <!-- Vue template -->
                <redux-provider :map-state-to-props="mapStateToProps" :store="store">
                    <wallet-menu
                        slot-scope="{wallets, activeWalletId}"
                        :wallets="wallets"
                        :active-wallet-id="activeWalletId"
                        @wallet-selected="walletSelected"
                        @rename-wallet="renameWallet"
                        @change-passphrase-wallet="changePassphraseWallet"
                        @export-wallet="exportWallet"
                        @logout-wallet="logoutWallet"
                        @create="create"
                        @login="login"
                    ></wallet-menu>
                </redux-provider>
                <!-- End Vue template -->
            </div>
        `
    }

    static get actions() {
        return {
            switchWallet,
        }
    }

    listeners() {
        return {
            'click [active-wallet-label]': () => this._toggleMenu()
        }
    }

    static mapStateToProps(state, props) {
        return {
            activeWallet: activeWallet$(state),
        }
    }

    _onPropertiesChanged(changes) {
        if (changes.activeWallet) {
            this.$('[active-wallet-label]').textContent = this.properties.activeWallet.label;
        }
    }

    onCreate() {
        super.onCreate()
        const self = this

        this._documentListener = this.__documentListener.bind(this)
        this._isMenuActive = false

        this.vue = new Vue({
            el: `#vue-wallet-menu-${this.attributes.instance}`,
            data: {
                store: MixinRedux.store
            },
            methods: {
                mapStateToProps(state) {
                    let wallets = walletsArray$(state)

                    /*if (!wallets) {
                        return {
                            wallets: [],
                            activeWalletId: 'LEGACY',
                        }
                    }*/

                    wallets = wallets.map(wallet => {
                        return Object.assign({}, wallet, {
                            accounts: new Map(new Array(wallet.numberAccounts).fill(0).map((_, i) => [i.toString(), 'dummy'])),
                            contracts: [],
                        })
                    })

                    return {
                        wallets,
                        activeWalletId: activeWalletId$(state),
                    }
                },
                walletSelected(walletId) {
                    self.actions.switchWallet(walletId)
                    self._hideMenu()
                },
                renameWallet(walletId) {
                    accountManager.rename(walletId)
                    self._hideMenu()
                },
                changePassphraseWallet(walletId) {
                    accountManager.changePassword(walletId)
                    self._hideMenu()
                },
                exportWallet(walletId) {
                    accountManager.export(walletId)
                    self._hideMenu()
                },
                logoutWallet(walletId) {
                    accountManager.logout(walletId)
                    self._hideMenu()
                },
                create() {
                    accountManager.create()
                    self._hideMenu()
                },
                login() {
                    accountManager.login()
                    self._hideMenu()
                },
            },
            components: {
                'redux-provider': ReduxProvider,
                'wallet-menu': NimiqVueComponents.WalletMenu,
            }
        })
    }

    _toggleMenu() {
        if (this._isMenuActive) return this._hideMenu()

        this.$el.classList.add('menu-active')
        this.$('.v-wallet-menu').classList.remove('display-none')
        this._isMenuActive = true

        document.addEventListener('click', this._documentListener)
    }

    _hideMenu() {
        this.$el.classList.remove('menu-active')
        this.$('.v-wallet-menu').classList.add('display-none')
        this._isMenuActive = false

        document.removeEventListener('click', this._documentListener)
    }

    __documentListener(event) {
        if (event.target.matches('v-wallet-selector, v-wallet-selector *')) return
        this._hideMenu()
    }
}
