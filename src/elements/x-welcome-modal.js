import XElement from '/libraries/x-element/x-element.js';
import MixinModal from '/elements/mixin-modal/mixin-modal.js';
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js';

export default class XWelcomeModal extends MixinRedux(MixinModal(XElement)) {

    html() {
        return `
            <div class="modal-header">
                <h2>Welcome to Nimiq Safe</h2>
            </div>
            <div class="modal-body center safe-logo-background">
                <h3 class="logo-margin-top">What is the Nimiq Safe?</h3>
                <ul>
                    <li>Nimiq Safe lets you securely manage your Nimiq accounts, send and receive NIM and view your balances.</li>
                    <li>Nimiq Safe is a free and open-source, client-side interface.</li>
                    <li>Nimiq Safe allows you to interact directly with the blockchain while remaining in full control of your keys & your funds.</li>
                </ul>

                <div class="options new">
                    <button class="onboard">Start here</button>
                </div>
            </div>
            `;
    }

    static mapStateToProps(state) {
        return {
            keyguardReady: state.connection.keyguard,
        };
    }

    _onPropertiesChanged(changes) {
        if (changes.keyguardReady) {
            this.$('.onboard').classList.remove('waiting');
        }
    }

    listeners() {
        return {
            'click button.onboard': this._onOnboard.bind(this),
        };
    }

    _onOnboard() {
        this.fire('x-welcome-onboard');
    }
}
