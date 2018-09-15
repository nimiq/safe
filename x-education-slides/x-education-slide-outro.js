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
                        Thanks for your attention! Now onwards to <span class="action-text"></span>.
                        <span class="keyguard-popup-info">
                            In the next step a popup window will open that contains the Nimiq Keyguard.
                            Just follow the steps and see you very soon in the Nimiq Safe!
                        </span>
                    </div>
                </div>

                <div class="button-bar">
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
                actionText = 'creating a new account for the Nimiq Safe';
                break;

            case 'import-words':
                actionText = 'importing your existing account';
                break;

            case 'import-file':
                actionText = 'importing your existing account';
                break;

            case 'import-ledger':
                actionText = 'importing an existing account from your ledger';
                this.$nextButton.textContent = 'Import from Ledger';
                this.$('.keyguard-popup-info').style.display = 'none';
                break;

            case 'upgrade':
                actionText = 'upgrading your existing account for the Nimiq Safe';
                break;
        }
        this.$('.action-text').innerText = actionText;
    }

    _onArrowNavigation(e) {
        if (e.keyCode === 37) {
            // left arrow
            return; // don't allow going back
        }
        super._onArrowNavigation(e);
    }

}
