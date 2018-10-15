import XElement from '/libraries/x-element/x-element.js';
import MixinModal from '/elements/mixin-modal/mixin-modal.js';
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js';
import XEducationSlides from '/elements/x-education-slides/x-education-slides.js';
import XToast from '/secure-elements/x-toast/x-toast.js';
import { upgradeableAccount$ } from '../selectors/needsUpgrade$.js';
import { getString } from '../strings.js'

export default class XWelcomeModal extends MixinRedux(MixinModal(XElement)) {

    html() {
        return `
            <div class="modal-header">
                <h2>${getString('intro_title')}</h2>
            </div>
            <div class="modal-body center safe-logo-background">
                <h3 class="logo-margin-top">${getString('intro_subtitle')}</h3>
                <ul>
                    <li>${getString('intro_list_1')}</li>
                    <li>${getString('intro_list_2')}</li>
                    <li>${getString('intro_list_3')}</li>
                </ul>

                <div class="options new">
                    <div class="spacing-bottom">
                        <strong>${getString('intro_create_account')}</strong>
                    </div>

                    <button class="create waiting spacing-bottom">${getString('intro_create_account')}</button>

                    <div class="spacing-bottom">
                        ${getString('intro_recover')}
                    </div>

                    <a secondary class="waiting" import-words-1>${getString('intro_24_words')}</a>
                    <a secondary class="waiting" import-file-1>${getString('intro_access_file')}</a>
                    <a secondary import-ledger-1>${getString('intro_ledger')}</a>
                </div>

                 <div class="options upgrade display-none">
                   <div class="spacing-bottom">
                        <strong>${getString('intro_upgrade_account')}</strong>
                    </div>

                    <button class="upgrade spacing-bottom">${getString('intro_upgrade_button')}</button>

                    <div class="spacing-bottom">
                        ${getString('intro_existing_account_import_instead')}
                    </div>

                    <a secondary import-words-2>${getString('intro_24_words')}</a>
                    <a secondary import-file-2>${getString('intro_access_file')}</a>
                    <a secondary import-ledger-2>${getString('intro_ledger')}</a>
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

        // executed when closing by clicking background
        XEducationSlides.onFinished = XEducationSlides.hide;
        XEducationSlides.action = 'none';
        XEducationSlides._slides = XEducationSlides.allSlides.slice(0, -1);
        XEducationSlides.start();

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
