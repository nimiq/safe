import XElement from '/libraries/x-element/x-element.js';
import MixinModal from '/elements/mixin-modal/mixin-modal.js';
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js';
import XEducationSlides from '/elements/x-education-slides/x-education-slides.js';
import XToast from '/secure-elements/x-toast/x-toast.js';

export default class XWelcomeMinerModal extends MixinRedux(MixinModal(XElement)) {

    html() {
        return `
            <style>
                body:not(.enable-ledger) [import-ledger] {
                    display: none;
                }
            </style>
            <div class="modal-header">
                <h2>Welcome to Nimiq Safe</h2>
            </div>
            <div class="modal-body center">
                <div>
                    To mine Nimiq with an existing account, you can import it to Nimiq Safe by using your 24 recovery words or your access file.
                </div>
               <h3>What is the Nimiq Safe?</h3>
                        <ul>
                            <li>The Nimiq Safe is a free, open-source, client-side interface.</li>
                            <li>It allows you to interact directly with the Nimiq blockchain while remaining in full control of your keys & your funds.</li>
                        </ul>
                
                <div class="options new">
                    <button class="waiting" import-words>Import from 24 Words</button>
                    <a secondary import-ledger>Import Ledger Account</a>
                    <a secondary class="waiting" import-file>Import from Access File</a>
                </div>
            </div>
            `
    }

    static mapStateToProps(state) {
        return {
            keyguardReady: state.connection.keyguard
        }
    }

    _onPropertiesChanged(changes) {
        if (changes.keyguardReady) {
            this.$('[import-words]').classList.remove('waiting');
            this.$('[import-file]').classList.remove('waiting');
        }
    }

    allowsHide(incomingModal) {
        if (incomingModal && (XEducationSlides.currentSlide === incomingModal)) {
            return true;
        }

        XToast.warn('Please read through this important information.');

        return false;
    }

    onShow() {
        XEducationSlides.entry = 'miner';
    }

    listeners() {
        return {
            'click [import-ledger]': this._onImportLedger.bind(this),
            'click [import-words]': this._onImportWords.bind(this),
            'click [import-file]': this._onImportFile.bind(this),
        }
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
}

// Todo: wording, content of this element
