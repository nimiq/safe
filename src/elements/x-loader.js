import XElement from '../lib/x-element/x-element.js';
import hubClient from '../hub-client.js';
import MixinRedux from './mixin-redux.js';
import { activeWallet$ } from '../selectors/wallet$.js';
import XSafe from './x-safe.js';

export default class XLoader extends MixinRedux(XElement) {

    static mapStateToProps(state) {
        return {
            activeWallet: activeWallet$(state),
            walletsLoaded: state.wallets.hasContent,
        }
    }

    _onPropertiesChanged(changes) {
        if (this.properties.walletsLoaded && !this.properties.activeWallet) {
            hubClient.onboard();
            return;
        }

        if (changes.walletsLoaded) {
            this._xSafe = new XSafe(this.$el);
        }
    }

    get relayedTxResolvers() {
        return this._xSafe.relayedTxResolvers;
    }
}
