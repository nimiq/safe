import XElement from '/libraries/x-element/x-element.js';
import accountManager from '../account-manager.js';
import BrowserDetection from '/libraries/secure-utils/browser-detection/browser-detection.js';
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js';
import { activeWallet$ } from '../selectors/wallet$.js';
import XSafe from './x-safe.js';

export default class XLoader extends MixinRedux(XElement) {

    html() {
        return `
            <div class="logo">
                <span class="nq-icon nimiq-logo"></span>
                <span class="logo-wordmark">Nimiq</span>
            </div>
            <div class="loading">
                <div class="loading-animation"></div>
                <h2>Hello Nimiq!</h2>
            </div>
        `
    }

    static mapStateToProps(state) {
        return {
            activeWallet: activeWallet$(state),
            walletsLoaded: state.wallets.hasContent,
        }
    }

    _onPropertiesChanged(changes) {
        if (this.properties.walletsLoaded && !this.properties.activeWallet) {
            accountManager.onboard();
            return;
        }

        if (changes.walletsLoaded) {
            const xSafe = new XSafe(this.$el);
            this.relayedTxResolvers = xSafe.relayedTxResolvers;
        }
    }
}
