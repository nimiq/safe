import XEducationSlide from './x-education-slide.js';

export default class XEducationSlideLoss extends XEducationSlide {
    html() {
        return `
            <h1 class="modal-header">
                How To Protect Yourself from Loss
            </h1>
            <div class="modal-body">
                <h3>If you lose your 24 recovery words, Pass Phrase or PIN, they are gone forever. Don't lose them.</h3>
                <div class="has-side-image">
                    <ul>
                        <li>Make a backup of your 24 recovery words and Pass Phrase. Do NOT just store it on your computer. Print or write it out on a piece of paper or save it to a USB drive.</li>
                        <li>Store this paper or USB drive in a different physical location. A backup is not useful if it is destroyed by a fire or flood along with your laptop.</li>
                        <li>Do not store your recovery words in Dropbox, Google Drive, or other cloud storage. If that account is compromised, your funds will be stolen.</li>
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
