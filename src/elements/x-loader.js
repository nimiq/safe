import XElement from '../lib/x-element/x-element.js';
import hubClient from '../hub-client.js';
import MixinRedux from './mixin-redux.js';
import { activeWallet$ } from '../selectors/wallet$.js';
import XSafe from './x-safe.js';

export default class XLoader extends MixinRedux(XElement) {

    static mapStateToProps(state) {
        return {
            activeWallet: activeWallet$(state),
            hasContent: state.wallets.hasContent,
        }
    }

    _onPropertiesChanged(changes) {
        // Allow for directly linking to Hub signup via the URL search params: .../?onboarding=signup
        const params = new URLSearchParams(window.location.search);
        if (params.get('onboarding') === 'signup') {
            hubClient.createViaRedirect();
            return;
        }

        if (this.properties.hasContent && !this.properties.activeWallet) {
            hubClient.onboard({
                disableBack: true,
            });
            return;
        }

        if (changes.hasContent) {
            this._xSafe = new XSafe(this.$el);
        }
    }

    get relayedTxResolvers() {
        return this._xSafe.relayedTxResolvers;
    }
}
