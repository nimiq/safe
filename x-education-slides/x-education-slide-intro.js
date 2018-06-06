import XEducationSlide from './x-education-slide.js';
import XEducationSlides from './x-education-slides.js';
import XWelcomeModal from '/apps/safe/src/elements/x-welcome-modal.js';
import XWelcomeMinerModal from '/apps/safe/src/elements/x-welcome-miner-modal.js';

export default class XEducationSlideIntro extends XEducationSlide {
    html() {
        return `
            <h1 class="modal-header">
                Important Information
            </h1>
            <div class="modal-body">
                <div class="has-side-image">
                    <div>
                        <div>
                            Alright, you can soon <span class="action-text"></span> Before that, we have some important information for you.
                        </div>
                        <div class="warning">
                            <p>Please take your time to understand this for your own safety. 🙏</p>
                            <p>Your funds may be stolen if you do not heed these warnings.</p>
                        </div>
                        <div class="warning">
                            We cannot recover your funds or freeze your account if you visit a phishing site or lose your private key.
                        </div>
                    </div>
                    <div class="side-image-intro"></div>
                </div>

                <div class="button-bar">
                    <button back>Back</button>
                    <button next>Nimiq is not a Bank</button>
                </div>
                
                <div class="spacing-top center">
                <a secondary>Skip AT YOUR OWN RISK</a>
                </div> 
            </div>
        `;
    }

    onCreate() {
        super.onCreate();

        this.$('a[secondary]').onclick = () => {
            XEducationSlides.hide();
        }
    }

    onShow() {
        super.onShow();

        let actionText;
        switch (XEducationSlides.action) {
            case 'create':
                actionText = 'create a new account for Nimiq Safe';
                break;

            case 'import-words':
                actionText = 'import an existing account';
                break;

            case 'import-file':
                actionText = 'import an existing account';
                break;

            case 'import-ledger':
                actionText = 'import an existing account from your ledger';
                break;

            case 'upgrade':
                actionText = 'upgrade your account for Nimiq Safe';
                break;

            default:
                this.onBack();
        }
        this.$('.action-text').innerText = actionText;
    }

    onBack() {
        if (XEducationSlides.entry === 'miner') {
            XWelcomeMinerModal.show();
        } else {
            XWelcomeModal.show();
        }
    }
}

// Todo: Fix import situation (import from apps/safe)
