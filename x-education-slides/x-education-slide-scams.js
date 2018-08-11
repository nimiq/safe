import XEducationSlide from './x-education-slide.js';

export default class XEducationSlideScams extends XEducationSlide {
    html() {
        return `
            <h1 class="modal-header">
                How To Protect Yourself from Scams
            </h1>
            <div class="modal-body">
                <h3>People will try to get you to give them money in return for nothing.</h3>
                <div class="has-side-image">
                    <ul>
                        <li>If it is too good to be true, it probably is.</li>
                        <li>Research before sending money to someone or some project. Look for information on a variety of websites and forums. Be wary.</li>
                        <li>Ask questions when you don't understand something or it doesn't seem right.</li>
                        <li>Don't let fear, FUD (fear, uncertainty and doubt), or FOMO (fear of missing out) win over common sense. If something is very urgent, ask yourself "why?". It may be to create FOMO or prevent you from doing research.</li>
                    </ul>
                    <div class="side-image-scams"></div>
                </div>

                <div class="button-bar">
                    <button back>Phishers</button>
                    <button next>Protect From Loss</button>
                </div>
                <div class="spacing-top center">
                    <a secondary class="skip">Skip AT YOUR OWN RISK</a>
                </div> 
            </div>
        `;
    }
}
