import XEducationSlide from './x-education-slide.js';
import XEducationSlides from './x-education-slides.js';

export default class XEducationSlideOutro extends XEducationSlide {
    html() {
        return `
            <h1 class="modal-header">
                Let's go
            </h1>
            <div class="modal-body">
                <div class="has-side-image">
                    <div>
                        <div>
                            Thanks for your patience! Now you are prepared to <span class="action-text"></span>.
                            
                            For that purpose, in the next step a popup window will open which contains the Keyguard app.
                            Just follow the steps there and see you very soon in Nimiq Safe!
                        </div>
                    </div>
                </div>

                <div class="button-bar">
                    <button back>Back</button>
                    <button next>Open Keyguard</button>
                </div>
            </div>
        `;
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

    allowsHide(incomingModal) {
        // Don't hide when keyguard opens (wait for it to finish), but don't show message neither.

        if (incomingModal
            && (incomingModal === XEducationSlides.previousSlide)
        ) {
            return true;
        }

        return false;
    }
}
