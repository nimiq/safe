import XEducationSlide from './x-education-slide.js';

export default class XEducationSlideLoss extends XEducationSlide {
    html() {
        return `
            <h1 class="modal-header">
                How To Protect Yourself from Loss
            </h1>
            <div class="modal-body">
                <h3>If you lose your 24 Recovery Words, Pass Phrase or PIN, they are gone forever. Don't lose them.</h3>
                <div class="has-side-image">
                    <ul>
                        <li>Make a backup of your 24 Recovery Words and Pass Phrase. Do NOT just store it on your computer. Print it out or write it down on a piece of paper.</li>
                        <li>Store one or more copies of this paper in one or more secure and private physical locations. A backup is not useful if it is destroyed by a fire or flood along with your computer.</li>
                        <li>Do not store your 24 Recovery Words in Dropbox, Google Drive, or other cloud storage. If that account is compromised, your funds will be stolen.</li>
                    </ul>
                    <div class="side-image-loss"></div>
                </div>

                <div class="button-bar">
                    <button back>Scams</button>
                    <button next>Got it</button>
                </div>
            </div>
        `;
    }
}
