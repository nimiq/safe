import XElement from '/libraries/x-element/x-element.js';
import MixinModal from '/elements/mixin-modal/mixin-modal.js';
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js';
import XEducationSlides from '/elements/x-education-slides/x-education-slides.js';
import XToast from '/secure-elements/x-toast/x-toast.js';
import { upgradeableAccount$ } from '../selectors/needsUpgrade$.js';

export default class XWelcomeModal extends MixinRedux(MixinModal(XElement)) {

    html() {
        return `
            <style>
                body:not(.enable-ledger) [import-ledger-1], body:not(.enable-ledger) [import-ledger-2] {
                    display: none;
                }
            </style>
            <div class="modal-header">
                <h2>Welcome to Nimiq Safe</h2>
            </div>
            <div class="modal-body center">
               <h3>What is the Nimiq Safe?</h3>
                        <ul>
                            <li>The Nimiq Safe is a free, open-source, client-side interface.</li>
                            <li>It allows you to interact directly with the Nimiq blockchain while remaining in full control of your keys & your funds.</li>
                        </ul>
                
                
                <div class="options new">
                    <div class="spacing-bottom">
                        For using Nimiq Safe, you need an account. If you have an access file or 24 recovery words,
                        you can use those to import your existing account.
                    </div>
                
                    <button class="create waiting">Create New Account</button>
                    <a secondary import-ledger-1>Import Ledger Account</a>
                    <a secondary class="waiting" import-words-1>Import from 24 Words</a>
                    <a secondary class="waiting" import-file-1>Import from Access File</a>
                </div>
                
                 <div class="options upgrade display-none">
                   <div class="spacing-bottom">
                        You can upgrade your existing miner account for Nimiq Safe, or if you have an access file or 24 recovery words,
                        you can use those to import your account.
                    </div>
                        
                    <button class="upgrade">Upgrade account</button>
                    <a secondary import-ledger-2>Import Ledger Account</a>
                    <a secondary import-words-2>Import from 24 Words</a>
                    <a secondary import-file-2>Import from Access File</a>
                </div>
            </div>
            `
    }

    static mapStateToProps(state) {
        return {
            keyguardReady: state.connection.keyguard,
            upgradedableAccount: upgradeableAccount$(state)
        }
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
        }
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
