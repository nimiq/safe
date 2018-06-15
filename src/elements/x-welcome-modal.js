import XElement from '/libraries/x-element/x-element.js';
import MixinModal from '/elements/mixin-modal/mixin-modal.js';
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js';
import XEducationSlides from '/elements/x-education-slides/x-education-slides.js';
import XToast from '/secure-elements/x-toast/x-toast.js';
import { upgradeableAccount$ } from '../selectors/needsUpgrade$.js';

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
                    <div class="spacing-bottom">
                        <strong>For using Nimiq Safe, you need an account:</strong>
                    </div>

                    <button class="create waiting spacing-bottom">Create New Account</button>

                    <div class="spacing-bottom">
                        If you have 24 Recovery Words or an Access File,
                        you can use those to import your existing account:
                    </div>

                    <a secondary class="waiting" import-words-1>Import from 24 Words</a>
                    <a secondary class="waiting" import-file-1>Import from Access File</a>
                    <a secondary import-ledger-1>Import Ledger Account</a>
                </div>

                 <div class="options upgrade display-none">
                   <div class="spacing-bottom">
                        <strong>You can upgrade your existing Miner Account for Nimiq Safe:</strong>
                    </div>

                    <button class="upgrade spacing-bottom">Upgrade account</button>

                    <div class="spacing-bottom">
                        Or if you have 24 Recovery Words or an Access File, you can use those to import your account.
                    </div>

                    <a secondary import-words-2>Import from 24 Words</a>
                    <a secondary import-file-2>Import from Access File</a>
                    <a secondary import-ledger-2>Import Ledger Account</a>
                </div>
            </div>
            `;
    }

    static mapStateToProps(state) {
        return {
            keyguardReady: state.connection.keyguard,
            upgradedableAccount: upgradeableAccount$(state)
        };
    }

    _onPropertiesChanged(changes) {
        if (changes.keyguardReady && !this.properties.upgradedableAccount) {
            this.$('.create').classList.remove('waiting');
            this.$('[import-words-1]').classList.remove('waiting');
            this.$('[import-file-1]').classList.remove('waiting');
        }

        if (changes.upgradedableAccount) {
            this.$('.options.new').classList.add('display-none');
            this.$('.options.upgrade').classList.remove('display-none');
        }
    }

    allowsHide(incomingModal) {
        if (incomingModal && (XEducationSlides.currentSlide === incomingModal)) {
            return true;
        }

        XToast.warn('Please read through this important information.');

        return false;
    }

    listeners() {
        return {
            'click button.create': this._onCreateAccount.bind(this),
            'click button.upgrade': this._onUpgradeAccount.bind(this),
            'click [import-ledger-1]': this._onImportLedger.bind(this),
            'click [import-words-1]': this._onImportWords.bind(this),
            'click [import-file-1]': this._onImportFile.bind(this),
            'click [import-ledger-2]': this._onImportLedger.bind(this),
            'click [import-words-2]': this._onImportWords.bind(this),
            'click [import-file-2]': this._onImportFile.bind(this)
        };
    }

    _onCreateAccount() {
        XEducationSlides.onFinished = () => this.fire('x-accounts-create');
        XEducationSlides.action = 'create';
        XEducationSlides.start();
    }

    _onImportLedger() {
        XEducationSlides.onFinished = () => this.fire('x-accounts-import-ledger');
        XEducationSlides.action = 'import-ledger';
        XEducationSlides.start();
    }

    _onImportWords() {
        XEducationSlides.onFinished = () => this.fire('x-accounts-import-words');
        XEducationSlides.action = 'import-words';
        XEducationSlides.start();
    }

    _onImportFile() {
        XEducationSlides.onFinished = () => this.fire('x-accounts-import-file');
        XEducationSlides.action = 'import-file';
        XEducationSlides.start();
    }

    _onUpgradeAccount() {
        XEducationSlides.onFinished = () => this.fire('x-upgrade-account', this.properties.upgradedableAccount.address);
        XEducationSlides.action = 'upgrade';
        XEducationSlides.start();
    }
}

// Todo: wording, content of this element
